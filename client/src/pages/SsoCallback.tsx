import { useEffect, useState } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";

export default function SsoCallback() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const [status, setStatus] = useState<string>("Processing OAuth callback...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[SsoCallback] Starting callback handler");
        
        // Wait for Clerk hooks to be loaded (with retry)
        let attempts = 0;
        while ((!isLoaded || !signInLoaded || !signUpLoaded) && attempts < 10) {
          console.log("[SsoCallback] Waiting for Clerk to load...", { 
            isLoaded, 
            signInLoaded, 
            signUpLoaded,
            attempt: attempts + 1 
          });
          await new Promise(resolve => setTimeout(resolve, 300));
          attempts++;
        }

        if (!isLoaded || !signInLoaded || !signUpLoaded) {
          console.warn("[SsoCallback] Clerk hooks not loaded after waiting");
          // Continue anyway - might still work
        }

        // Check URL for OAuth callback parameters
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const allParams = Object.fromEntries(searchParams);
        const hasCallbackParams = searchParams.has("__clerk_redirect_url") || 
                                  searchParams.has("__clerk_status") ||
                                  url.hash.includes("__clerk") ||
                                  url.search.includes("code=") ||
                                  url.search.includes("state=") ||
                                  searchParams.has("__clerk_created_session") ||
                                  Object.keys(allParams).some(key => key.startsWith("__clerk"));

        console.log("[SsoCallback] Full URL check:", { 
          fullUrl: window.location.href,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          hasCallbackParams, 
          allParams,
          isSignedIn,
          isLoaded,
          signInLoaded,
          signUpLoaded
        });

        // FIRST: Check if Clerk has already processed the OAuth automatically
        // Sometimes Clerk completes OAuth before we call handleRedirectCallback
        const clerk = (window as any).Clerk;
        const hasClerkUserBefore = clerk?.user !== null && clerk?.user !== undefined;
        const hasClerkSessionBefore = clerk?.session !== null && clerk?.session !== undefined;
        
        console.log("[SsoCallback] Initial Clerk state:", {
          hasClerkUserBefore,
          hasClerkSessionBefore,
          clerkUserId: clerk?.user?.id
        });
        
        // If already signed in, skip handleRedirectCallback
        if (isSignedIn || hasClerkUserBefore || hasClerkSessionBefore) {
          console.log("[SsoCallback] User already signed in, skipping handleRedirectCallback");
          setStatus("OAuth successful! Redirecting...");
          
          // Check if new user needs role selection
          const userId = clerk?.user?.id;
          if (userId) {
            try {
              const session = clerk?.session;
              const token = session ? await session.getToken() : null;
              if (token) {
                const response = await fetch("/api/auth/user", {
                  headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                  const user = await response.json();
                  if (!user?.role) {
                    console.log("[SsoCallback] New user without role, redirecting to role selection");
                    window.location.href = "/role";
                    return;
                  }
                }
              }
            } catch (err) {
              console.log("[SsoCallback] Couldn't check user role");
            }
          }
          
          window.location.href = "/";
          return;
        }

        // SECOND: Try to handle redirect callback if signIn/signUp are available
        // This is the proper way to complete OAuth in Clerk
        if (signIn || signUp) {
          setStatus("Completing OAuth...");
          
          if (signIn) {
            try {
              console.log("[SsoCallback] Attempting signIn.handleRedirectCallback()");
              const result = await signIn.handleRedirectCallback();
              console.log("[SsoCallback] SignIn handleRedirectCallback result:", result);
              
              if (result.status === 'complete' && result.createdSessionId) {
                console.log("[SsoCallback] OAuth complete via signIn, setting session...");
                if (setActiveSignIn) {
                  await setActiveSignIn({ session: result.createdSessionId });
                }
                setStatus("OAuth successful! Redirecting...");
                await new Promise(resolve => setTimeout(resolve, 800));
                window.location.href = "/";
                return;
              } else {
                console.log("[SsoCallback] SignIn callback incomplete:", result.status);
              }
            } catch (signInError: any) {
              // handleRedirectCallback throws if there's no pending redirect
              // This is normal - it means Clerk might have processed it automatically
              const errorMsg = signInError?.message || String(signInError);
              console.log("[SsoCallback] SignIn handleRedirectCallback error (this is often normal):", {
                message: errorMsg,
                errorCode: signInError?.errors?.[0]?.code,
                fullError: signInError
              });
              
              // Check if error is "no redirect to handle" - this means Clerk processed it automatically
              if (errorMsg.includes("no redirect") || errorMsg.includes("No redirect") || 
                  errorMsg.includes("not found") || signInError?.errors?.[0]?.code === "form_identifier_not_found") {
                console.log("[SsoCallback] No pending redirect - Clerk may have processed OAuth automatically");
                // Continue to check if user is signed in
              } else {
                // Other error - might be a sign-up instead, continue to try signUp
                console.log("[SsoCallback] Different error, will try signUp");
              }
            }
          }

          if (signUp) {
            try {
              console.log("[SsoCallback] Attempting signUp.handleRedirectCallback()");
              const result = await signUp.handleRedirectCallback();
              console.log("[SsoCallback] SignUp handleRedirectCallback result:", result);
              
              if (result.status === 'complete' && result.createdSessionId) {
                console.log("[SsoCallback] OAuth complete via signUp, setting session...");
                if (setActiveSignUp) {
                  await setActiveSignUp({ session: result.createdSessionId });
                }
                setStatus("OAuth successful! Checking user role...");
                
                // Wait a moment for session to be set
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // For sign-up, check if user has a role, if not go to role selection
                const clerkAfter = (window as any).Clerk;
                const userId = clerkAfter?.user?.id;
                if (userId) {
                  try {
                    const session = clerkAfter?.session;
                    const token = session ? await session.getToken() : null;
                    if (token) {
                      const response = await fetch("/api/auth/user", {
                        headers: { 'Authorization': `Bearer ${token}` },
                      });
                      if (response.ok) {
                        const user = await response.json();
                        if (!user?.role) {
                          console.log("[SsoCallback] New user, redirecting to role selection");
                          window.location.href = "/role";
                          return;
                        }
                      }
                    }
                  } catch (err) {
                    console.log("[SsoCallback] Couldn't check user role, defaulting to role selection");
                    // If we can't check, default to role selection for new users
                    window.location.href = "/role";
                    return;
                  }
                }
                console.log("[SsoCallback] User has role, redirecting to home");
                window.location.href = "/";
                return;
              } else {
                console.log("[SsoCallback] SignUp callback incomplete:", result.status);
              }
            } catch (signUpError: any) {
              // handleRedirectCallback throws if there's no pending redirect
              const errorMsg = signUpError?.message || String(signUpError);
              console.log("[SsoCallback] SignUp handleRedirectCallback error (this is often normal):", {
                message: errorMsg,
                errorCode: signUpError?.errors?.[0]?.code,
                fullError: signUpError
              });
              
              // Check if error is "no redirect to handle" - this means Clerk processed it automatically
              if (errorMsg.includes("no redirect") || errorMsg.includes("No redirect") || 
                  errorMsg.includes("not found")) {
                console.log("[SsoCallback] No pending redirect - Clerk may have processed OAuth automatically");
                // Continue to check if user is signed in
              }
            }
          }
        }

        // THIRD: If handleRedirectCallback didn't work, wait and check if Clerk processed OAuth automatically
        console.log("[SsoCallback] handleRedirectCallback didn't complete, waiting for Clerk to process OAuth...");
        
        // Wait longer for Clerk to potentially process the OAuth callback automatically
        // Clerk might process it in the background
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const clerkCheck = (window as any).Clerk;
          const hasClerkUser = clerkCheck?.user !== null && clerkCheck?.user !== undefined;
          const hasClerkSession = clerkCheck?.session !== null && clerkCheck?.session !== undefined;
          
          console.log(`[SsoCallback] Check ${i + 1}/5 - auth state:`, {
            isSignedIn,
            hasClerkUser,
            hasClerkSession,
            clerkUserId: clerkCheck?.user?.id,
            clerkSessionId: clerkCheck?.session?.id
          });
          
          if (isSignedIn || hasClerkUser || hasClerkSession) {
            console.log("[SsoCallback] User is signed in! Redirecting...");
            setStatus("OAuth successful! Redirecting...");
            
            // For new users, check if they have a role
            const userId = clerkCheck?.user?.id;
            if (userId) {
              try {
                const session = clerkCheck?.session;
                const token = session ? await session.getToken() : null;
                if (token) {
                  const response = await fetch("/api/auth/user", {
                    headers: { 'Authorization': `Bearer ${token}` },
                  });
                  if (response.ok) {
                    const user = await response.json();
                    if (!user?.role) {
                      console.log("[SsoCallback] New user without role, redirecting to role selection");
                      window.location.href = "/role";
                      return;
                    }
                  }
                }
              } catch (err) {
                console.log("[SsoCallback] Couldn't check user role, redirecting to home");
              }
            }
            
            window.location.href = "/";
            return;
          }
        }

        // Failed - user not signed in after OAuth
        const finalClerk = (window as any).Clerk;
        console.error("[SsoCallback] OAuth callback failed - user not signed in after all checks");
        console.error("[SsoCallback] Final state:", {
          isSignedIn,
          hasClerkUser: finalClerk?.user !== null && finalClerk?.user !== undefined,
          hasClerkSession: finalClerk?.session !== null && finalClerk?.session !== undefined,
          clerk: !!finalClerk,
          clerkUser: !!finalClerk?.user,
          clerkSession: !!finalClerk?.session,
          clerkUserId: finalClerk?.user?.id,
          fullUrl: window.location.href
        });
        
        setStatus("OAuth failed. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/auth?mode=login";
        }, 2000);
      } catch (error) {
        console.error("[SsoCallback] Error handling callback:", error);
        setStatus("Error processing OAuth. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/auth?mode=login";
        }, 2000);
      }
    };

    handleCallback();
  }, [isLoaded, isSignedIn, signInLoaded, signUpLoaded, signIn, signUp, setActiveSignIn, setActiveSignUp]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-gray-600">{status}</p>
      </div>
    </div>
  );
}

