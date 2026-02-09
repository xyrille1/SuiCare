
import { flow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai } from './genkit'; // Your configured AI instance

// Define the input schema for the flow
const SuggestionRequest = z.object({
  title: z.string(),
  description: z.string(),
  goal: z.number(),
});

// Define the output schema for the flow. Genkit will use this to validate the model's JSON output.
const SuggestionResponse = z.object({
  suggestions: z.array(z.number()).length(3),
});

// Define the Genkit flow
export const suggestDonations = flow(
  {
    name: 'suggestDonations',
    inputSchema: SuggestionRequest,
    outputSchema: SuggestionResponse,
  },
  async (input: z.infer<typeof SuggestionRequest>) => {
    const { title, description, goal } = input;

    // Construct the prompt for the AI model
    const prompt = `
      A user is considering donating to a campaign with the following details:
      - Title: ${title}
      - Description: ${description}
      - Goal: ${goal} SUI

      Based on this information, suggest three donation amounts (integers) that are appropriate and encouraging.
      The suggestions should be relative to the campaign's goal.
    `;

    // Call the AI model and ask for structured JSON output
    const llmResponse = await ai.generate({
      prompt,
      config: { temperature: 0.7 },
      output: {
        format: 'json',
        schema: SuggestionResponse,
      },
    });

    const output = llmResponse.output;

    // If the model output is null (e.g., due to parsing failure), return a fallback.
    if (!output) {
      const fallbackAmounts = [10, 50, 100].map(amount => Math.min(amount, goal));
      return { suggestions: fallbackAmounts };
    }

    // Otherwise, return the validated output from the model.
    return output;
  }
);
