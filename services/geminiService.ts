import { GoogleGenAI } from "@google/genai";

export const generateReportSummary = async (
  date: string,
  siteName: string,
  tasks: string[],
  notes: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API Key is missing for Gemini.");
    return "يرجى توفير مفتاح API لتفعيل الميزات الذكية.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      أنت مساعد ذكي لشركة تنظيف. قم بإنشاء ملخص احترافي وقصير لتقرير يومي باللغة العربية بناءً على البيانات التالية:
      - التاريخ: ${date}
      - الموقع: ${siteName}
      - المهام المنجزة: ${tasks.join(", ")}
      - ملاحظات المشرف: ${notes}
      
      الأسلوب يجب أن يكون رسميًا ومختصرًا.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "لم يتم إنشاء ملخص.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالمساعد الذكي.";
  }
};