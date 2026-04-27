"use client";
import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import TemplateList from "./templates";

const Template = () => {
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <button
        className="fixed top-3 right-3 sm:top-6 sm:right-6"
        onClick={handleClose}
      >
        <XIcon className="h-6 w-6" />
      </button>
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* <section className="mb-8 sm:mb-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Templates
            </h2>
          </div>
        </section> */}

        <div className="max-w-6xl mx-auto">
          <TemplateList />
        </div>
      </div>
    </div>
  );
};

export default Template;
