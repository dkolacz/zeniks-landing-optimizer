import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How does Zeniks work?",
      answer: "Simply provide us with the URL of your rental listing. Our AI model will analyze your listing's content, photos, reviews, location, and other key factors to identify areas for improvement. You'll then receive a detailed report with specific suggestions to optimize your listing."
    },
    {
      question: "What aspects of my listing does Zeniks analyze?",
      answer: "Zeniks analysis covers various aspects of your listing, including the clarity and effectiveness of your listing title and description, the quality and composition of your photos, the sentiment expressed in your reviews, host information and location of your rental."
    },
    {
      question: "What kind of recommendations does Zeniks provide?",
      answer: "Zeniks provides specific, actionable recommendations tailored to your listing. This might include suggestions to improve your listing's text, enhance your photos, highlight key amenities, address negative review trends, and optimize your overall presentation to attract more guests."
    },
    {
      question: "How long does it take to receive my report?",
      answer: "You will typically receive your personalized report via email within 24-48 hours of submitting your listing URL and payment."
    },
    {
      question: "What platforms does Zeniks support?",
      answer: "Zenik supports listings from Airbnb, VRBO, Booking.com, and independent vacation rental websites."
    },
    {
      question: "Will Zeniks rewrite my listing for me?",
      answer: "No, Zeniks provides recommendations and insights, but it does not automatically rewrite your listing. You will need to implement the suggestions yourself."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-zeniks-gray-dark">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-zeniks-gray-light rounded-lg px-6 py-2"
              >
                <AccordionTrigger className="text-lg font-semibold text-zeniks-gray-dark hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zeniks-gray-dark">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;