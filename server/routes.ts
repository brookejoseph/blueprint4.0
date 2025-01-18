import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from "@db";
import type { User, Routine } from "@db/schema";
import { scrapeProtocolSections, findRelevantSections } from "./utils/protocol-scraper";

const PROTOCOL_URL = "https://protocol.bryanjohnson.com"; // Add PROTOCOL_URL constant

let cachedProtocolSections: any[] = [];

async function initializeProtocolSections() {
  try {
    // Check if we already have sections in the database
    const existingSections = await db.query.protocolSections.findMany();
    console.log("within the init function existingSections ",existingSections);

    if (existingSections.length === 0) {
      // Scrape and store sections if none exist
      const sections = await scrapeProtocolSections();

      for (const section of sections) {
        await db.insert(protocolSections).values({
          sectionId: section.id,
          title: section.title,
          content: section.content,
          categories: section.categories,
          url: section.url,
        });
      }

      cachedProtocolSections = sections;
    } else {
      cachedProtocolSections = existingSections.map(section => ({
        id: section.sectionId,
        title: section.title,
        content: section.content,
        categories: section.categories,
        url: section.url,
      }));
    }
  } catch (error) {
    console.error('Error initializing protocol sections:', error);
  }
}

// Initialize protocol sections when server starts
initializeProtocolSections();

export function registerRoutes(app: Express): Server {
  app.post("/api/routines", async (req, res) => {
    try {
      const userData = req.body;
      if (!userData) {
        return res.status(400).json({ error: "No user data provided" });
      }
      console.log('Creating user with data:', userData);

      // Create user with all questionnaire data
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            name: userData.name,
            age: userData.age,
            gender: userData.gender,
            improvement_areas: userData.improvementAreas,
            budget: userData.budget,
            equipment: userData.equipment,
            current_health: userData.currentHealth,
          })
          .select()
          .single();

        if (userError) {
          console.error('User creation error:', userError);
          throw userError;
        }

        if (!user) {
          throw new Error('User creation failed - no user returned');
        }

      console.log('User created:', user);

      // Find relevant protocol sections based on user preferences
      const relevantSections = findRelevantSections({
        improvementAreas: userData.improvementAreas,
        currentHealth: userData.currentHealth,
        equipment: userData.equipment,
      });

      // Generate personalized routine based on user data
      const routine = generateRoutine(userData, relevantSections);
      console.log('Generated routine:', routine);

      // Save routine with protocol links and embedded sections
      console.log('Attempting to save routine with data:', {
        user_id: user.id,
        supplements: routine.supplements,
        diet: routine.diet,
        exercise: routine.exercise,
        sleep_schedule: routine.sleepSchedule,
        metrics: routine.metrics,
      });

      const routineData = {
        user_id: user.id,
        supplements: routine.supplements,
        diet: routine.diet,
        exercise: routine.exercise,
        sleep_schedule: routine.sleepSchedule,
        metrics: routine.metrics,
        protocol_links: routine.protocolLinks,
        embedded_sections: routine.embeddedSections,
      };

      console.log('Attempting to save routine with data:', routineData);

      const { data: savedRoutine, error: routineError } = await supabase
        .from('routines')
        .insert(routineData)
        .select()
        .single();

      if (routineError) {
        console.error('Supabase error saving routine:', routineError);
        throw new Error(`Failed to save routine: ${routineError.message}`);
      }

      if (!savedRoutine) {
        throw new Error('Routine creation failed - no routine returned');
      }

      console.log('Successfully saved routine:', savedRoutine);
      res.json(savedRoutine);
    } catch (error: any) {
        console.error('Error creating routine:', error);
        res.status(500).json({ 
          error: error.message || "Failed to create routine",
          details: error
        });
      }
    } catch (error: any) {
      console.error('Error in route handler:', error);
      res.status(500).json({ 
        error: error.message || "Failed to create routine",
        details: error
      });
    }
  });

  app.get("/api/routines/:id", async (req, res) => {
    try {
      const routineId = parseInt(req.params.id);
      if (isNaN(routineId)) {
        console.log('Invalid routine ID');
        return res.status(400).json({ error: "Invalid routine ID" });
      }
      console.log('Fetching routine with ID:', routineId);

      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();

      if (routineError) throw routineError;

      if (!routine) {
        console.log('Routine not found for ID:', routineId);
        return res.status(404).json({ error: "Routine not found" });
      }

      console.log('Found routine:', routine);
      res.json(routine);
    } catch (error) {
      console.error('Error fetching routine:', error);
      res.status(500).json({ error: "Failed to fetch routine" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateRoutine(userData: any, relevantSections: Map<string, string>) {
  // Find the most relevant embedded sections from cached protocol data
  // Enhanced matching to find specific, relevant content for each component
  const findRelevantContent = (category: string, specificTerms: string[]) => {
    return cachedProtocolSections
      .filter(section => {
        // Look for exact category matches first
        const categoryMatch = section.categories.includes(category);

        // Then check for specific term matches in the content
        const contentMatch = specificTerms.some(term => 
          section.content.toLowerCase().includes(term.toLowerCase())
        );

        return categoryMatch || contentMatch;
      })
      .sort((a, b) => {
        // Score sections based on relevance
        const getScore = (section: any) => {
          let score = 0;
          // Category match is worth more
          if (section.categories.includes(category)) score += 5;
          // Count matches of specific terms
          specificTerms.forEach(term => {
            const matches = (section.content.toLowerCase().match(new RegExp(term.toLowerCase(), 'g')) || []).length;
            score += matches;
          });
          return score;
        };
        return getScore(b) - getScore(a);
      })
      [0]; // Take the most relevant section
  };

  // Find relevant sections for each protocol component
  const supplementSection = findRelevantContent('supplements', [
    'vitamin', 'mineral', 'omega', 'dosage', 'morning', 'evening'
  ]);

  const dietSection = findRelevantContent('diet', [
    'meal', 'nutrition', 'eating window', 'vegetables', 'protein'
  ]);

  const exerciseSection = findRelevantContent('exercise', [
    'workout', 'training', 'cardio', 'strength', 'mobility'
  ]);

  const sleepSection = findRelevantContent('sleep', [
    'circadian', 'bedtime', 'wake', 'melatonin', 'deep sleep'
  ]);

  const metricsSection = findRelevantContent('testing', [
    'biomarker', 'measurement', 'tracking', 'monitoring', 'data'
  ]);

  // Create links with text fragments for specific, relevant content
  const protocolLinks = {
    supplements: supplementSection?.url || `${PROTOCOL_URL}#supplements`,
    exercise: exerciseSection?.url || `${PROTOCOL_URL}#exercise`,
    diet: dietSection?.url || `${PROTOCOL_URL}#perfect-diet`,
    sleep: sleepSection?.url || `${PROTOCOL_URL}#sleep`,
    testing: metricsSection?.url || `${PROTOCOL_URL}#measurements`,
  };

  // Create embedded sections with the most relevant content
  const embeddedSections = [
    supplementSection,
    dietSection,
    exerciseSection,
    sleepSection,
    metricsSection
  ]
    .filter(Boolean)
    .map(section => ({
      title: section.title,
      content: section.content,
      url: section.url,
    }));

  // Rest of the routine generation remains unchanged
  return {
    supplements: [
      { 
        name: "Vitamin D3", 
        dosage: "2,000 IU", 
        timing: "Morning",
        reference: protocolLinks.supplements 
      },
      { 
        name: "Omega-3", 
        dosage: "2g EPA, 1g DHA", 
        timing: "With meals",
        reference: protocolLinks.supplements 
      },
    ],
    diet: {
      meals: [
        "Green Giant (morning smoothie)",
        "Nutty Pudding breakfast",
        "Super Veggie lunch",
      ],
      restrictions: [
        "No food 3 hours before bedtime",
        "Vegan except for specific supplements"
      ],
      schedule: ["Breakfast 6am", "Lunch 11am", "Dinner 4pm"],
      reference: protocolLinks.diet
    },
    exercise: {
      type: "Zone 2 cardio + strength training",
      frequency: "Daily",
      duration: "1 hour",
      reference: protocolLinks.exercise
    },
    sleepSchedule: {
      bedtime: "20:30",
      wakeTime: "05:30",
      sleepGoal: 8,
      reference: protocolLinks.sleep
    },
    metrics: {
      trackWeight: true,
      trackSleep: true,
      trackSteps: true,
      trackSupplements: true,
      reference: protocolLinks.testing
    },
    protocolLinks,
    embeddedSections,
  };
}