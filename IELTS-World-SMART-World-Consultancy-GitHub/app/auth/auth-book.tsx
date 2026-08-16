"use client";

import { FormEvent, useState } from "react";
import { LanguageSwitcher, useSiteLanguage } from "../components/SiteLanguage";

type AuthView = "signin" | "signup" | "verify" | "forgot" | "reset" | "phone";
type ApiResult = { ok?:boolean; error?:string; message?:string; email?:string; phone?:string; needsVerification?:boolean; previewCode?:string };
type FirebaseResult = { idToken:string; email:string; emailVerified:boolean; displayName:string; phoneNumber:string };
type FirebaseBridge = {
  setLanguage:(language:"en"|"bn")=>void;
  signInEmail:(email:string,password:string)=>Promise<FirebaseResult>;
  signUpEmail:(name:string,email:string,password:string)=>Promise<{email:string}>;
  sendPasswordReset:(email:string)=>Promise<void>;
  startPhone:(phone:string,containerId:string)=>Promise<{ok:boolean}>;
  confirmPhone:(code:string)=>Promise<FirebaseResult>;
};

declare global { interface Window { IELTSFirebaseAuth?:FirebaseBridge } }
let firebaseBridgePromise:Promise<FirebaseBridge>|null = null;

function firebaseBridge():Promise<FirebaseBridge> {
  if (window.IELTSFirebaseAuth) return Promise.resolve(window.IELTSFirebaseAuth);
  if (firebaseBridgePromise) return firebaseBridgePromise;
  firebaseBridgePromise = new Promise((resolve,reject) => {
    const ready = () => window.IELTSFirebaseAuth ? resolve(window.IELTSFirebaseAuth) : reject(new Error("Firebase Authentication did not start."));
    window.addEventListener("ielts-firebase-auth-ready",ready,{once:true});
    let script = document.getElementById("firebase-auth-module") as HTMLScriptElement|null;
    if (!script) {
      script = document.createElement("script");
      script.id = "firebase-auth-module";
      script.type = "module";
      script.src = "/firebase-auth.js";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("error",()=>reject(new Error("Firebase Authentication could not be loaded.")),{once:true});
    window.setTimeout(()=>{ if (!window.IELTSFirebaseAuth) reject(new Error("Firebase Authentication timed out.")); },20000);
  });
  return firebaseBridgePromise;
}

async function postJson(path:string,payload:Record<string,unknown>):Promise<ApiResult> {
  const response = await fetch(path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
  const result = await response.json().catch(()=>({error:"Unexpected server response."})) as ApiResult;
  if (!response.ok && !result.error) result.error = "The request could not be completed.";
  return result;
}

function firebaseError(error:unknown,bn:boolean):string {
  const code = typeof error === "object" && error && "code" in error ? String((error as {code?:string}).code || "") : "";
  const messages:Record<string,[string,string]> = {
    "auth/email-not-verified":["Verify your email from the link we sent, then sign in.","পাঠানো link থেকে email যাচাই করে আবার sign in করুন।"],
    "auth/invalid-credential":["Email or password is incorrect.","Email অথবা password সঠিক নয়।"],
    "auth/user-not-found":["No account was found with this information.","এই তথ্য দিয়ে কোনো account পাওয়া যায়নি।"],
    "auth/email-already-in-use":["An account already exists with this email. Please sign in.","এই email দিয়ে account রয়েছে। Sign in করুন।"],
    "auth/weak-password":["Choose a stronger password.","আরও শক্তিশালী password দিন।"],
    "auth/invalid-phone-number":["Enter a valid mobile number with country code.","Country code-সহ সঠিক mobile number দিন।"],
    "auth/invalid-verification-code":["The SMS verification code is incorrect.","SMS verification code সঠিক নয়।"],
    "auth/too-many-requests":["Too many attempts. Please wait and try again.","অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে চেষ্টা করুন।"],
    "auth/quota-exceeded":["Firebase SMS quota is unavailable. Contact support.","Firebase SMS quota পাওয়া যাচ্ছে না। Support-এর সাথে যোগাযোগ করুন।"],
  };
  if (messages[code]) return messages[code][bn?1:0];
  return error instanceof Error && error.message ? error.message : (bn?"Authentication সম্পন্ন হয়নি। আবার চেষ্টা করুন।":"Authentication could not be completed. Please try again.");
}

function internationalPhone(value:string):string {
  const compact = value.replace(/[\s()-]/g,"");
  if (/^\+\d{10,15}$/.test(compact)) return compact;
  const digits = compact.replace(/\D/g,"");
  if (/^01\d{9}$/.test(digits)) return `+88${digits}`;
  if (/^8801\d{9}$/.test(digits)) return `+${digits}`;
  throw Object.assign(new Error("Enter a valid phone number."),{code:"auth/invalid-phone-number"});
}

export function AuthBook({admin,returnTo,initialError}:{admin:boolean;returnTo:string;initialError?:string}) {
  const [view,setView] = useState<AuthView>("signin");
  const [email,setEmail] = useState("");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState(initialError||"");
  const [isError,setIsError] = useState(Boolean(initialError));
  const [phone,setPhone] = useState("");
  const [phoneCodeSent,setPhoneCodeSent] = useState(false);
  const {language} = useSiteLanguage();
  const bn = language === "bn";

  function changeView(next:AuthView) { setView(next); setMessage(""); setIsError(false); }
  async function perform(action:()=>Promise<void>) {
    setBusy(true); setMessage(""); setIsError(false);
    try { await action(); }
    catch(error) { setMessage(firebaseError(error,bn)); setIsError(true); }
    finally { setBusy(false); }
  }
  async function exchange(result:FirebaseResult,remember=true,target=returnTo) {
    const session = await postJson("/api/auth/firebase-session",{idToken:result.idToken,remember});
    if (session.error) {
      if (session.needsVerification) { setEmail(session.email||result.email); setView("verify"); }
      throw new Error(session.error);
    }
    window.location.assign(target);
  }

  function signIn(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const enteredEmail=String(form.get("email")||""); const password=String(form.get("password")||""); const remember=form.get("remember")==="on"; setEmail(enteredEmail);
    void perform(async()=>{
      if(admin){const result=await postJson("/api/auth/login",{email:enteredEmail,password,remember});if(result.error)throw new Error(result.error);window.location.assign(returnTo);return;}
      const bridge=await firebaseBridge();bridge.setLanguage(language);await exchange(await bridge.signInEmail(enteredEmail,password),remember);
    });
  }
  function signUp(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=new FormData(event.currentTarget); const enteredEmail=String(form.get("email")||""); const name=String(form.get("name")||""); const password=String(form.get("password")||"");
    if(password!==form.get("confirmPassword")){setMessage(bn?"Password দুটি এক নয়।":"The passwords do not match.");setIsError(true);return;}
    setEmail(enteredEmail);
    void perform(async()=>{const bridge=await firebaseBridge();bridge.setLanguage(language);await bridge.signUpEmail(name,enteredEmail,password);setView("verify");setMessage(bn?"Firebase আপনার email-এ verification link পাঠিয়েছে। Link-এ click করে তারপর sign in করুন।":"Firebase sent a verification link to your email. Open the link, then sign in.");});
  }
  function forgotPassword(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const enteredEmail=String(new FormData(event.currentTarget).get("email")||""); setEmail(enteredEmail);
    void perform(async()=>{
      if(admin){const result=await postJson("/api/auth/forgot-password",{email:enteredEmail});if(result.error)throw new Error(result.error);setView("reset");setMessage(result.previewCode?`Development reset code: ${result.previewCode}`:(result.message||"If the account exists, a reset code has been sent."));return;}
      const bridge=await firebaseBridge();bridge.setLanguage(language);await bridge.sendPasswordReset(enteredEmail);setView("signin");setMessage(bn?"Password reset link পাঠানো হয়েছে। Email দেখুন।":"A password reset link has been sent. Check your email.");
    });
  }
  function resetAdminPassword(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=new FormData(event.currentTarget);if(form.get("password")!==form.get("confirmPassword")){setMessage("The passwords do not match.");setIsError(true);return;}
    void perform(async()=>{const result=await postJson("/api/auth/reset-password",{email,code:form.get("code"),password:form.get("password")});if(result.error)throw new Error(result.error);setView("signin");setMessage("Password changed. You can now sign in.");});
  }
  function phoneSignIn(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=new FormData(event.currentTarget);void perform(async()=>{const bridge=await firebaseBridge();bridge.setLanguage(language);if(!phoneCodeSent){const normalized=internationalPhone(String(form.get("phone")||phone));setPhone(normalized);await bridge.startPhone(normalized,"firebase-recaptcha");setPhoneCodeSent(true);setMessage(bn?"SMS code পাঠানো হয়েছে।":"An SMS code has been sent.");return;}await exchange(await bridge.confirmPhone(String(form.get("code")||"")),true);});}

  const showTabs=(view==="signin"||view==="signup")&&!admin;
  const phoneButton=<div className="phone-auth-actions"><button type="button" className="phone-auth-button" onClick={()=>{setPhoneCodeSent(false);changeView("phone");}} disabled={busy}><strong>☎</strong>{bn?"Mobile OTP দিয়ে চালিয়ে যান":"Continue with mobile OTP"}</button></div>;

  return <main className="auth-stage normal-auth-stage">
    <button type="button" className="auth-back" onClick={()=>window.location.assign("/#top")}>← {bn?"ওয়েবসাইটে ফিরুন":"Back to website"}</button><div className="auth-language"><LanguageSwitcher/></div>
    <section className="auth-book-scene auth-normal-scene" aria-label={`${admin?"Admin":"Student"} authentication`}><div className="auth-book-object auth-normal-card"><div className="auth-spread">
      <aside className="auth-story-page"><div className="auth-panel-brand"><img src="/brand-logo.png" alt="IELTS World & SMART World Consultancy logo"/><span>IELTS World &amp;<br/>SMART World Consultancy</span></div><span className="kicker">{admin?"SECURE CONTROL CENTER":"FIREBASE PROTECTED ACCOUNT"}</span><h1>{admin?(bn?"স্বাগতম, অ্যাডমিন।":"Welcome back, Admin."):(bn?"আপনার বৈশ্বিক ভবিষ্যৎ গড়ুন।":"Build your global future.")}</h1><p>{admin?(bn?"সুরক্ষিত জায়গা থেকে শিক্ষার্থী, enquiry ও documents পরিচালনা করুন।":"Manage students, enquiries and documents through one protected workspace."):(bn?"Firebase-সুরক্ষিত account দিয়ে application অনুসরণ, document upload এবং counsellor-এর সাথে যোগাযোগ করুন।":"Use your Firebase-protected account to track applications, upload documents and stay connected with your counsellor.")}</p><div className="story-stats"><span><strong>10+</strong>{bn?"গন্তব্য":"Destinations"}</span><span><strong>1:1</strong>{bn?"গাইডেন্স":"Guidance"}</span></div></aside>
      <div className="auth-form-page">
        {showTabs&&<div className="auth-switch" role="tablist" aria-label="Account action"><button type="button" className={view==="signin"?"active":""} onClick={()=>changeView("signin")} role="tab" aria-selected={view==="signin"}>{bn?"সাইন ইন":"Sign In"}</button><button type="button" className={view==="signup"?"active":""} onClick={()=>changeView("signup")} role="tab" aria-selected={view==="signup"}>{bn?"সাইন আপ":"Sign Up"}</button><span className={view}/></div>}
        {message&&<div className={`auth-message ${isError?"error":"success"}`} role="status">{message}</div>}
        {view==="signin"&&<form onSubmit={signIn} className="auth-form signin-form"><span className="auth-step">01</span><h2>{admin?(bn?"অ্যাডমিন সাইন ইন":"Admin sign in"):(bn?"শিক্ষার্থী সাইন ইন":"Student sign in")}</h2><p>{admin?(bn?"Configured admin account ব্যবহার করুন।":"Use the configured administrator account."):(bn?"Firebase-এ যাচাইকৃত account দিয়ে চালিয়ে যান।":"Continue with your verified Firebase account.")}</p><label>{bn?"ইমেইল ঠিকানা":"Email address"}<input name="email" type="email" defaultValue={email} autoComplete="email" placeholder="you@example.com" required/></label><label>{bn?"পাসওয়ার্ড":"Password"}<input name="password" type="password" autoComplete="current-password" placeholder="••••••••••" required/></label><div className="form-row"><label className="check"><input name="remember" type="checkbox"/> {bn?"মনে রাখুন":"Remember me"}</label><button type="button" className="text-button" onClick={()=>changeView("forgot")}>{bn?"Password ভুলে গেছেন?":"Forgot password?"}</button></div><button className="auth-submit" disabled={busy}>{busy?(bn?"অপেক্ষা করুন…":"Please wait…"):(bn?"নিরাপদে চালিয়ে যান":"Continue securely")}<span>→</span></button>{!admin&&<><div className="auth-divider"><span>{bn?"অথবা":"or"}</span></div>{phoneButton}<small className="secure-note">{bn?"Firebase identity যাচাইয়ের পর HttpOnly website session তৈরি হয়।":"Firebase verifies your identity before a protected HttpOnly website session is created."}</small></>}</form>}
        {view==="signup"&&<form onSubmit={signUp} className="auth-form signup-form"><span className="auth-step">02</span><h2>{bn?"শিক্ষার্থী account তৈরি করুন":"Create student account"}</h2><p>{bn?"Firebase email verification-এর মাধ্যমে নিরাপদ account খুলুন।":"Open a secure account with Firebase email verification."}</p><label>{bn?"পূর্ণ নাম":"Full name"}<input name="name" autoComplete="name" required/></label><label>{bn?"ইমেইল ঠিকানা":"Email address"}<input name="email" type="email" autoComplete="email" required/></label><div className="auth-password-grid"><label>{bn?"পাসওয়ার্ড":"Password"}<input name="password" type="password" autoComplete="new-password" minLength={10} required/></label><label>{bn?"আবার লিখুন":"Confirm"}<input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required/></label></div><small className="password-hint">{bn?"কমপক্ষে ১০ অক্ষর, uppercase, lowercase ও number দিন।":"Use 10+ characters with uppercase, lowercase and a number."}</small><button className="auth-submit" disabled={busy}>{busy?(bn?"তৈরি হচ্ছে…":"Creating…"):(bn?"Account তৈরি করুন":"Create account")}<span>→</span></button><div className="auth-divider"><span>{bn?"অথবা":"or"}</span></div>{phoneButton}</form>}
        {view==="verify"&&<div className="auth-form firebase-email-note"><button type="button" className="auth-inline-back" onClick={()=>changeView("signin")}>← {bn?"সাইন ইনে ফিরুন":"Back to sign in"}</button><div className="verification-emblem">✉</div><h2>{bn?"আপনার email যাচাই করুন":"Verify your email"}</h2><p>{email}</p><p>{bn?"Firebase পাঠানো verification link-এ click করুন। সফল হলে এই page-এ ফিরে sign in করুন।":"Open the verification link sent by Firebase. After verification, return here and sign in."}</p><button type="button" className="auth-submit" onClick={()=>changeView("signin")}>{bn?"আমি যাচাই করেছি":"I have verified my email"}<span>→</span></button></div>}
        {view==="forgot"&&<form onSubmit={forgotPassword} className="auth-form"><button type="button" className="auth-inline-back" onClick={()=>changeView("signin")}>← {bn?"সাইন ইনে ফিরুন":"Back to sign in"}</button><h2>{bn?"Password পুনরুদ্ধার":"Recover password"}</h2><p>{admin?(bn?"Admin reset code email-এ পাঠানো হবে।":"An administrator reset code will be emailed."):(bn?"Firebase আপনার email-এ password reset link পাঠাবে।":"Firebase will email you a password reset link.")}</p><label>{bn?"ইমেইল ঠিকানা":"Email address"}<input name="email" type="email" defaultValue={email} autoComplete="email" required/></label><button className="auth-submit" disabled={busy}>{bn?"Reset link পাঠান":"Send reset link"}<span>→</span></button></form>}
        {view==="reset"&&admin&&<form onSubmit={resetAdminPassword} className="auth-form"><button type="button" className="auth-inline-back" onClick={()=>changeView("signin")}>← Back to sign in</button><h2>Choose a new password</h2><p>{email}</p><label>Reset code<input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required/></label><div className="auth-password-grid"><label>New password<input name="password" type="password" minLength={10} required/></label><label>Confirm<input name="confirmPassword" type="password" minLength={10} required/></label></div><button className="auth-submit" disabled={busy}>Change password<span>→</span></button></form>}
        {view==="phone"&&<form onSubmit={phoneSignIn} className="auth-form firebase-phone-form"><button type="button" className="auth-inline-back" onClick={()=>changeView("signin")}>← {bn?"সাইন ইনে ফিরুন":"Back to sign in"}</button><h2>{bn?"Mobile OTP দিয়ে sign in":"Sign in with mobile OTP"}</h2><p>{bn?"SMS verification-এর জন্য Bangladesh mobile number দিন। Standard SMS charge প্রযোজ্য হতে পারে।":"Enter your Bangladesh mobile number for SMS verification. Standard SMS charges may apply."}</p><label>{bn?"মোবাইল নম্বর":"Mobile number"}<input name="phone" type="tel" value={phone} onChange={event=>setPhone(event.target.value)} placeholder="01XXXXXXXXX" disabled={phoneCodeSent} required/></label>{phoneCodeSent&&<label>{bn?"৬ সংখ্যার SMS code":"6-digit SMS code"}<input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="123456" required/></label>}<div id="firebase-recaptcha" className="firebase-recaptcha"/><button className="auth-submit" disabled={busy}>{busy?(bn?"অপেক্ষা করুন…":"Please wait…"):(phoneCodeSent?(bn?"Code যাচাই করুন":"Verify code"):(bn?"SMS code পাঠান":"Send SMS code"))}<span>→</span></button>{phoneCodeSent&&<button type="button" className="text-button auth-resend" onClick={()=>setPhoneCodeSent(false)}>{bn?"নতুন code পাঠান":"Send a new code"}</button>}</form>}
      </div>
    </div></div></section>
  </main>;
}
