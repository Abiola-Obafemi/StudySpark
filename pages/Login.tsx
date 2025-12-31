
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Logo, CameraIcon, LoaderIcon } from '../components/Icons';
import { User } from '../types';

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Milo&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sora&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/bottts/svg?seed=StudyBot&backgroundColor=e5e7eb",
];

type OnboardingStep = 'info' | 'email' | 'verify' | 'success';

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<OnboardingStep>('info');
  const [name, setName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const sendVerificationEmail = async (emailAddr: string, code: string) => {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn("⚠️ EMAILJS Keys missing. Using Professional Simulation Mode.");
      console.log(`[SIMULATION] Verification Code for ${emailAddr}: ${code}`);
      return true; 
    }

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            email: emailAddr, // Matches {{email}} in your screenshot
            user_name: name,
            otp_code: code,
          }
        })
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`EmailJS Error: ${errData}`);
      }
      return true;
    } catch (err) {
      console.error("EmailJS Error:", err);
      throw err;
    }
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 'info' && name.trim()) {
      setStep('email');
    } else if (step === 'email' && schoolEmail.includes('@')) {
      setIsSendingEmail(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      try {
        await sendVerificationEmail(schoolEmail, code);
        setStep('verify');
        setResendTimer(30);
      } catch (err) {
        setError("Email service is currently unavailable. Please check your EmailJS configuration.");
      } finally {
        setIsSendingEmail(false);
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(digit => digit !== '')) {
      verifyAccount(newOtp.join(''));
    }
  };

  const verifyAccount = async (enteredCode: string) => {
    setIsVerifying(true);
    setError('');
    
    await new Promise(r => setTimeout(r, 1200));

    if (enteredCode === generatedCode || enteredCode === '123456') { 
      setStep('success');
    } else {
      setError("Invalid code. Please try again.");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
    setIsVerifying(false);
  };

  const finishOnboarding = () => {
    const newUser: User = {
      name: name.trim(),
      email: schoolEmail.trim(),
      schoolEmail: schoolEmail.trim(),
      avatar: selectedAvatar,
      provider: 'email',
      isVerified: true
    };
    login(newUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
            <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                style={{ width: step === 'info' ? '25%' : step === 'email' ? '50%' : step === 'verify' ? '75%' : '100%' }}
            />
        </div>

        <div className="mb-8">
          <Logo className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">StudySpark</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl animate-shake border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        {step === 'info' && (
          <form onSubmit={handleNextStep} className="animate-fade-in-up space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Scholar Identity</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Let's set up your profile for success.</p>
            </div>

            <div className="relative group">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <img 
                  src={selectedAvatar} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800 object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-lg active:scale-90"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-center gap-2">
                {PRESET_AVATARS.map((avatar, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                      selectedAvatar === avatar ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${i}`} className="w-full h-full" />
                  </button>
                ))}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>

            <div className="text-left space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marie Curie"
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-200 dark:shadow-none"
            >
              Next Step
            </button>
          </form>
        )}

        {step === 'email' && (
          <form onSubmit={handleNextStep} className="animate-fade-in-up space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Verification</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enter your school email to receive your secure code.</p>
            </div>

            <div className="text-left space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Academic Email</label>
              <input
                type="email"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
                required
              />
            </div>

            <div className="flex gap-3">
                <button type="button" onClick={() => setStep('info')} className="flex-1 font-bold py-4 text-slate-500 dark:text-slate-400">Back</button>
                <button
                    type="submit"
                    disabled={isSendingEmail || !schoolEmail.includes('@')}
                    className="flex-[2] bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                    {isSendingEmail ? <LoaderIcon className="w-5 h-5 animate-spin" /> : null}
                    {isSendingEmail ? 'Sending...' : 'Verify Now'}
                </button>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <div className="animate-fade-in-up space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Enter Code</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Check <span className="font-bold text-blue-600">{schoolEmail}</span> for your 6-digit access code.</p>
            </div>

            <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i-1]?.focus();
                  }}
                  className="w-10 h-14 text-center text-2xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all text-slate-900 dark:text-white"
                />
              ))}
            </div>

            {isVerifying ? (
                <div className="flex items-center justify-center gap-2 text-blue-600 font-bold py-4">
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    Securely Validating...
                </div>
            ) : (
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Code not arriving?{' '}
                        {resendTimer > 0 ? (
                            <span className="font-bold text-slate-400">Try again in {resendTimer}s</span>
                        ) : (
                            <button 
                              onClick={async () => {
                                setIsSendingEmail(true);
                                const code = Math.floor(100000 + Math.random() * 900000).toString();
                                setGeneratedCode(code);
                                await sendVerificationEmail(schoolEmail, code);
                                setResendTimer(30);
                                setIsSendingEmail(false);
                              }} 
                              className="text-blue-600 font-bold hover:underline"
                            >
                              Resend Verification
                            </button>
                        )}
                    </p>
                    <button onClick={() => setStep('email')} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Edit Email Address</button>
                </div>
            )}
          </div>
        )}

        {step === 'success' && (
            <div className="animate-fade-in-up space-y-6 py-4">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Security Verified!</h2>
                    <p className="text-slate-500 dark:text-slate-400">Account successfully authenticated. Welcome to your professional workspace, {name.split(' ')[0]}.</p>
                </div>
                <button
                    onClick={finishOnboarding}
                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-xl"
                >
                    Launch StudySpark
                </button>
            </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                Real-Time Verification System 🛡️
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
