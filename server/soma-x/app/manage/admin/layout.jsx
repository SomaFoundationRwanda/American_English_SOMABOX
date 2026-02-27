"use client"
import HeaderSection from "@/components/ui/HeaderSection";
import { useLanguage } from '@/context/LanguageContext';
const layout = ({children}) => {
    const { t, setLang, lang } = useLanguage();
    return ( 
        <div>
            <HeaderSection
                title={t("adminTitle")}
                subtitle={t("adminSubtitle")}
                buttonText={t("logout")}
            />
            {children}
        </div>
    );
}

export default layout;