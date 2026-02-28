import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  issueDate: Date;
  score: number;
}

const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateProps>(({ studentName, courseTitle, issueDate, score }, ref) => {
  return (
    <div 
      ref={ref} 
      className="w-[1123px] h-[794px] bg-[#FAF9F6] relative font-sans p-12 shrink-0 flex flex-col justify-center items-center text-[#1E293B] shadow-2xl overflow-hidden"
    >
      {/* Outer Border Layering */}
      <div className="absolute inset-8 border-[12px] border-double border-[#C5A880] opacity-80 pointer-events-none z-10"></div>
      <div className="absolute inset-[44px] border border-[#C5A880] opacity-40 pointer-events-none z-10"></div>
      
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none">
        <Award size={600} className="text-[#1a202c]" strokeWidth={1} />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#C5A880]/10 to-transparent pointer-events-none blur-3xl rounded-full translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1a202c]/5 to-transparent pointer-events-none blur-3xl rounded-full -translate-x-32 translate-y-32"></div>

      {/* Main Content Container */}
      <div className="z-20 w-full flex flex-col items-center text-center px-20">
         
         {/* Top Branding / Header */}
         <div className="flex flex-col items-center mb-4">
            <ShieldCheck size={40} className="text-[#C5A880] mb-3 stroke-1 shadow-sm" />
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-5xl text-[#1a202c] uppercase tracking-[0.18em] font-black">
              Certificate
            </h1>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl text-[#C5A880] tracking-[0.25em] font-light mt-2 uppercase">
              Of Completion
            </h2>
         </div>

         {/* Separator Line */}
         <div className="w-24 h-[2px] bg-[#C5A880] mb-6"></div>

         <p className="text-sm font-bold tracking-[0.25em] text-gray-400 uppercase mb-4">This is to certify that</p>
         
         {/* Student Name */}
         <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-6xl italic font-bold text-[#1a202c] mb-4 pb-4 border-b border-gray-200 w-full max-w-2xl mx-auto drop-shadow-sm">
            {studentName}
         </h3>

         <p className="text-lg text-gray-600 mb-6 max-w-3xl leading-relaxed">
           has successfully fulfilled all requirements and completed the comprehensive curriculum for the educational program:
         </p>
         
         {/* Course Title */}
         <h4 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-[#1a202c] mb-6 uppercase tracking-wide">
           {courseTitle}
         </h4>

         {/* Footer Area: Date, Seal, Signature */}
         <div className="w-full flex items-end justify-between px-10 mt-2">
           
           {/* Date Area */}
           <div className="flex flex-col items-center w-64 pb-2">
             <span className="text-xl font-medium text-gray-800 mb-2">
               {issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
             <div className="w-full h-[1px] bg-gray-400"></div>
             <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-3 font-bold">Date of Issuance</span>
           </div>

           {/* Center Gold/Navy Seal */}
           <div className="relative flex items-center justify-center translate-y-3">
              <div className="w-32 h-32 bg-[#1a202c] rounded-full border-4 border-[#C5A880] flex flex-col items-center justify-center shadow-2xl relative z-10 before:absolute before:inset-1 before:border before:border-[#C5A880] before:border-dashed before:rounded-full before:opacity-60 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                 <span className="text-[#C5A880] text-[10px] uppercase font-black tracking-widest leading-none mb-1 shadow-sm">Score</span>
                 <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-white text-3xl font-bold tabular-nums drop-shadow-md">
                   {score}%
                 </span>
                 <div className="flex gap-1 mt-1 text-[#C5A880] text-[10px]">
                    ★ ★ ★
                 </div>
              </div>
           </div>

           {/* Signature Area */}
           <div className="flex flex-col items-center w-64 pb-2">
             <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl italic text-[#1a202c] leading-none mb-1 z-10">Amjad Pitafi</span>
             <div className="w-full h-[1px] bg-gray-400 z-0"></div>
             <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-3 font-bold">Lead Instructor</span>
           </div>
         </div>

      </div>
    </div>
  );
});

export default CertificateTemplate;
