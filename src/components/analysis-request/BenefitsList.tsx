import { Check } from "lucide-react";

const BenefitsList = () => {
  const benefits = [
    "Comprehensive analysis of your listing's content, photos, and pricing",
    "Detailed recommendations to improve your listing's visibility",
    "Insights on how to optimize your pricing strategy",
    "Tips to enhance your property's presentation",
    "Suggestions to improve your guest communication",
    "Actionable steps to increase your booking rate",
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-zeniks-gray-dark">
        What You'll Get
      </h2>
      <ul className="space-y-4">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-zeniks-purple mt-0.5 flex-shrink-0" />
            <span className="text-zeniks-gray-dark">{benefit}</span>
          </li>
        ))}
      </ul>
      <div className="pt-4">
        <p className="text-sm text-zeniks-gray-dark">
          You'll receive your detailed analysis report within 24-48 hours via email.
        </p>
      </div>
    </div>
  );
};

export default BenefitsList;