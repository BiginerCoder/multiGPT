import { Zap, MessageSquare, Brain, Shield, Globe, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Multiple AI Models',
    description: 'Access GPT-4, Claude, Gemini, and more - all in one place',
  },
  {
    icon: MessageSquare,
    title: 'Smart Conversations',
    description: 'Switch between models mid-conversation for the best results',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized infrastructure for instant responses',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never used for training',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Support for 50+ languages with natural understanding',
  },
  {
    icon: Sparkles,
    title: 'Advanced Features',
    description: 'Code execution, image generation, and document analysis',
  },
];

export default function Features() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need in one platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the power of multiple AI models working together to give you the best possible answers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <feature.icon className="text-blue-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
