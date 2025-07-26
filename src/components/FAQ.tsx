import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      emoji: "🧠",
      question: "How does Zeniks work?",
      answer:
        "You paste your Airbnb listing URL. Our AI analyzes the content, reviews, and presentation, then generates a **personalized report** with specific improvements.",
    },
    {
      emoji: "🔍",
      question: "What aspects of my listing does Zeniks analyze?",
      answer:
        "We look at your **title, photos, description, pricing, reviews**, and more to uncover what's helping — or hurting — your performance.",
    },
    {
      emoji: "📋",
      question: "What kind of recommendations does Zeniks provide?",
      answer:
        "You'll get clear, tailored suggestions to **improve discoverability**, attract more clicks, and **boost your booking rate**.",
    },
    {
      emoji: "⏱️",
      question: "How long does it take to receive my report?",
      answer:
        "You'll receive your report in **under 24 hours**. During the beta, it may take slightly longer as we fine-tune the process.",
    },
    {
      emoji: "🛏️",
      question: "What platforms does Zeniks support?",
      answer:
        "Currently, Zeniks is optimized for **Airbnb listings only**. Support for VRBO or Booking.com may be added in the future.",
    },
    {
      emoji: "🖊️",
      question: "Will Zeniks rewrite my listing for me?",
      answer:
        "Not yet — but soon. For now, we give you **copy-ready suggestions** you can easily paste into your Airbnb listing.",
    },
  ];

  return (
    <section className="py-20 bg-zeniks-gray-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zeniks-purple mb-4">
            Still Wondering How It Works?
          </h2>
          <p className="text-xl text-zeniks-gray-dark max-w-2xl mx-auto">
            We've helped dozens of hosts optimize their listings. Here are answers to the most common questions.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-0"
              >
                <AccordionTrigger className="text-lg font-semibold text-zeniks-gray-dark hover:text-zeniks-purple text-left px-6 py-4 hover:no-underline">
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{faq.emoji}</span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-zeniks-gray-dark px-6 pb-4">
                  <div 
                    dangerouslySetInnerHTML={{
                      __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong class="text-zeniks-purple font-semibold">$1</strong>')
                    }}
                  />
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