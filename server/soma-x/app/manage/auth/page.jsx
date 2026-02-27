"use client"
import DataContext from "@/context/DataContext";
import { useContext, useState } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Radio, RadioGroup } from "@/components/ui/radio";
import Typography from "@/components/ui/Typography";
import { toast } from "sonner";


const AuthComp = () => {
  const { t, setLang, lang } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = ["en", "fr", "rw", "sw", "es"];

  const { shiftString } = useContext(DataContext)
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // If role is teacher, go to /teacher, else go to /admin
    // if (formData.role === 'teacher') {
    //     window.location.href = '/manage/teacher'
    // } else {
    //     window.location.href = '/manage/admin'
    // }
    const login = async () => {
      try {
        console.log("Form Data:", formData);
        const response = await fetch(`${SERVER_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Login successful:", data);
          toast.success(t("auth.loginSuccess") || "Login successful!");

          localStorage.setItem('al', shiftString(formData.username));
          localStorage.setItem('gh', shiftString(formData.role));

          setTimeout(() => {
            window.location.href = '/manage/admin';
          }, 1000);
        } else {
          console.error("Login failed");
          const errorData = await response.json();
          toast.error(errorData.message || t("auth.loginFailed") || "Incorrect username or password");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error(t("auth.serverError") || "Could not connect to the server. Please check your connection.");
      }
    }
    login();
  }

  return (
    // <div className={`bg-accent-light w-full md:h-[98vh] flex flex-col gap-3 md:gap-0 md:flex-row items-center justify-center p-4 md:rounded-2xl`}>
    <div
      className={`bg-accent-light w-full min-h-screen md:min-h-[98vh] md:h-[96vh] md:my-2 flex flex-col md:flex-row items-center justify-center p-4  md:rounded-3xl shadow-2xl relative overflow-y-auto`}
    >
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center gap-6 py-12 md:py-0 text-accent-light-2 text-center">
        {/* Language Switcher */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50">
          <Button
            variant="ghost"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center hover:bg-black/40 transition-all border border-white/10"
          >
            <Globe className="w-4 h-4 mr-2" />
            <Typography variant="body" color="white" weight="bold">
              {lang.toUpperCase()}
            </Typography>
            <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
          </Button>

          {showLangMenu && (
            <div className="absolute top-12 right-0 bg-white text-black rounded-xl shadow-2xl z-50 overflow-hidden min-w-[120px] animate-in fade-in zoom-in duration-200">
              {languages.map((l) => (
                <Button
                  key={l}
                  variant="ghost"
                  onClick={() => {
                    setLang(l);
                    setShowLangMenu(false);
                  }}
                  className="block px-6 py-3 hover:bg-slate-100 w-full text-left normal-case border-none rounded-none font-bold"
                >
                  {l.toUpperCase()}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className={`font-black text-5xl md:text-7xl tracking-tighter`}>{t("auth.authTitle")}</h2>
          <Typography variant="body" className="opacity-80 text-lg md:text-xl text-white-500 font-medium max-w-sm mx-auto">
            {t("auth.authSubtitle")}
          </Typography>
        </div>
      </div>

      <form action="" onSubmit={handleSubmit} className={`w-full md:w-1/2 bg-white/95 backdrop-blur-md py-10 px-6 md:px-12 md:h-full rounded-2xl md:rounded-l-none md:rounded-r-3xl flex flex-col gap-6 justify-center shadow-xl`}>
        <div className="space-y-2 mb-4">
          <Typography variant="h3" color="accent" className="text-accent-dark">Welcome back</Typography>
          <Typography variant="muted">Please enter your credentials to continue</Typography>
        </div>

        <Input
          type="email"
          id="auth-username"
          placeholder={t("auth.authUsername")}
          required
          onChange={(val) => setFormData({ ...formData, username: val })}
          className={`bg-slate-100 border-none h-10 rounded-md px-4 text-accent-dark font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-accent-dark/20 transition-all`}
        />
        <Input
          type="password"
          variant="password"
          id="auth-password"
          placeholder={t("auth.authPassword")}
          required
          onChange={(val) => setFormData({ ...formData, password: val })}
          className={`bg-slate-100 border-none h-10 rounded-md px-4 text-accent-dark font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-accent-dark/20 transition-all`}
        />

        <div className="space-y-4 py-2">
          <Typography variant="label" className="opacity-50 text-[10px] px-1 font-black">
            Sign in as:
          </Typography>
          <RadioGroup
            name="role"
            value={formData.role}
            onChange={(val) => setFormData({ ...formData, role: val })}
            className="flex-row gap-3"
          >
            <Radio
              id="select-teacher"
              value="teacher"
              label={t("auth.authTeacher")}
              className="flex-1 bg-slate-100 text-black hover:bg-slate-200/50 border border-slate-300 !text-accent-dark font-bold p-4 rounded-xl transition-all"
            />
            <Radio
              id="select-admin"
              value="admin"
              label={t("auth.authAdmin")}
              className="flex-1 bg-slate-100 text-black hover:bg-slate-200/50 border border-slate-300 !text-accent-dark font-bold p-4 rounded-xl transition-all"
            />
          </RadioGroup>
        </div>

        <Button variant="default" type="submit" width="full" className="h-16 text-xl font-black shadow-lg shadow-accent-dark/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 rounded-2xl bg-accent-dark hover:bg-accent-dark/90 text-white">
          {t("auth.authLogin")}
        </Button>
      </form>
    </div>
  );
}

export default AuthComp;