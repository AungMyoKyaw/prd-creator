import { FormEvent, Dispatch, SetStateAction } from 'react';
import { PrdInput } from '../lib/prd';
import { Button } from './button';
import { InputField } from './input-field';
import { Section } from './section';
import { TextareaField } from './textarea-field';

interface PRDFormProps {
  prdInput: PrdInput;
  setPrdInput: Dispatch<SetStateAction<PrdInput>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onRefineSection: (sectionTitle: string) => void;
}

export function PRDForm({
  prdInput,
  setPrdInput,
  onSubmit,
  isLoading,
  onRefineSection
}: PRDFormProps) {
  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (event) => {
    const { name, value } = event.target;
    setPrdInput((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Section
        title="1. Core Product Idea"
        onRefine={() => onRefineSection('1. Core Product Idea')}
      >
        <InputField
          label="Product Name"
          id="productName"
          name="productName"
          value={prdInput.productName}
          onChange={handleChange}
          placeholder="e.g., Apollo - The AI Trip Planner"
          required
        />
        <TextareaField
          label="Problem Statement"
          id="problemStatement"
          name="problemStatement"
          value={prdInput.problemStatement}
          onChange={handleChange}
          description="What specific problem is this product trying to solve for its users?"
          placeholder="e.g., Planning a group trip is chaotic and time-consuming..."
          required
        />
        <TextareaField
          label="Proposed Solution"
          id="proposedSolution"
          name="proposedSolution"
          value={prdInput.proposedSolution}
          onChange={handleChange}
          description="Briefly describe how your product solves this problem."
          placeholder="e.g., A mobile app that centralizes itineraries, budgets, and communication..."
          required
        />
      </Section>

      <Section
        title="2. Audience & Market"
        onRefine={() => onRefineSection('2. Audience & Market')}
      >
        <TextareaField
          label="Target Audience"
          id="targetAudience"
          name="targetAudience"
          value={prdInput.targetAudience}
          onChange={handleChange}
          description="Who are the primary users of this product? Be specific."
          placeholder="e.g., Tech-savvy millennials aged 25-40 who frequently travel in groups..."
          required
        />
        <TextareaField
          label="Business Goals & Success Metrics"
          id="businessGoals"
          name="businessGoals"
          value={prdInput.businessGoals}
          onChange={handleChange}
          description="What are the key business objectives and how will you measure success (KPIs)?"
          placeholder="e.g., Goal: Achieve 10,000 monthly active users in 6 months. KPI: User retention rate > 30%..."
        />
      </Section>

      <Section
        title="3. Features & Scope"
        onRefine={() => onRefineSection('3. Features & Scope')}
      >
        <TextareaField
          label="Core Features (MVP)"
          id="coreFeatures"
          name="coreFeatures"
          value={prdInput.coreFeatures}
          onChange={handleChange}
          description="List the absolute essential features for the first version. Use bullet points or numbered lists."
          placeholder="- Collaborative Itinerary Planning\n- Shared Expense Tracking\n- Group Chat"
          required
        />
        <TextareaField
          label="Future Features (Post-MVP)"
          id="futureFeatures"
          name="futureFeatures"
          value={prdInput.futureFeatures}
          onChange={handleChange}
          description="What are some potential features for future releases?"
          placeholder="- Booking integrations (flights, hotels)\n- AI-powered recommendations\n- Offline mode"
        />
      </Section>

      <Section
        title="4. Technical Details (Optional)"
        onRefine={() => onRefineSection('4. Technical Details (Optional)')}
      >
        <TextareaField
          label="Technology Stack"
          id="techStack"
          name="techStack"
          value={prdInput.techStack}
          onChange={handleChange}
          placeholder="e.g., React Native, Firebase, Node.js"
          rows={3}
        />
        <TextareaField
          label="Constraints & Dependencies"
          id="constraints"
          name="constraints"
          value={prdInput.constraints}
          onChange={handleChange}
          description="Are there any known technical limitations, budget constraints, or dependencies?"
          placeholder="e.g., Must integrate with Stripe API for payments. Budget is limited to $50k for MVP."
        />
      </Section>

      <div className="pt-2">
        <Button type="submit" isLoading={isLoading} size="lg">
          Generate PRD
        </Button>
      </div>
    </form>
  );
}
