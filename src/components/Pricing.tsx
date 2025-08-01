
import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import sampleReport from "@/assets/sample-report.jpg";

const Pricing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="pricing" className="py-20 bg-zeniks-gray-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-zeniks-purple mb-6">
            See What Your Personalized Report Will Look Like
          </h2>
          <p className="text-xl text-zeniks-gray-dark mb-8 max-w-2xl mx-auto">
            Want a sneak peek? Check out a real report and see the insights and recommendations you'll get.
          </p>
          
          <div className="mb-8">
            <img 
              src={sampleReport} 
              alt="Sample Zeniks AI report preview" 
              className="w-full max-w-xs mx-auto h-auto rounded-xl shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow duration-300"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg"
                className="bg-zeniks-purple text-white px-8 py-4 text-lg font-semibold hover:bg-opacity-90 transition-all inline-flex items-center gap-2"
              >
                📄 View Sample Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="text-zeniks-purple text-xl font-bold">
                  Sample Zeniks AI Report
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <img 
                  src={sampleReport} 
                  alt="Sample Zeniks AI listing analysis report" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
