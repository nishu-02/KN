import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Text, Button, TextInput, ProgressBar } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as FileSystem from 'expo-file-system';

// ===============================================
// 🔑 GEMINI API CONFIGURATION - UPDATE THIS! 
// ===============================================
// IMPORTANT: Install image manipulator with: expo install expo-image-manipulator
const GEMINI_CONFIG = {
  API_KEY: 'AIzaSyBU24O2jBGCyr-8k0sTFq7E4e0-XNuePh0', // 👈 PUT YOUR API KEY HERE
  MODEL: 'gemini-2.0-flash-exp',
  TIMEOUT: 90000, // 90 seconds for thorough analysis
  MAX_TOKENS: 2500, // Increased for detailed response
  TEMPERATURE: 0.3, // Balanced for accuracy and detaila
};
// ===============================================

export default function UploadRescueScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const imageUri = route.params?.imageUri;

  // State for Gemini API with all required fields for the card
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState({
    // Basic information
    title: "",
    description: "",
    species: "Unknown",
    age: "Unknown",
    gender: "Unknown",
    weight: "Unknown",
    
    // Health assessment
    severity: "Unknown",
    injurySummary: "",
    symptoms: [],
    urgency: "Unknown",
    behavior: "Unknown",
    context: "Unknown",
    vetTimeline: "Unknown",
    
    // AI analysis
    aiConfidence: "Unknown",
    
    // Care information
    careTips: [],
    actions: [],
    
    // Progress values for the card (0.0 to 1.0)
    severityProgress: 0,
    urgencyProgress: 0,
    behaviorProgress: 0,
    ageProgress: 0,
    aiConfidenceProgress: 0,
    
    // Metadata
    time: new Date().toLocaleTimeString(),
    location: { latitude: 0, longitude: 0 },
    image: imageUri,
  });

  // Helper function to compress/resize image
  const compressImage = async (uri: string): Promise<string> => {
    try {
      const { manipulateAsync, SaveFormat } = require('expo-image-manipulator');
      
      const result = await manipulateAsync(
        uri,
        [
          { resize: { width: 1024 } } // Good resolution for AI analysis
        ],
        { 
          compress: 0.8, // High quality for better analysis
          format: SaveFormat.JPEG 
        }
      );
      
      return result.uri;
    } catch (error) {
      console.log('Image compression failed, using original:', error);
      return uri;
    }
  };

  // Enhanced Gemini API call with detailed prompt
  const fetchGemini = useCallback(async () => {
    if (!imageUri) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Starting enhanced Gemini API analysis...');
      
      // Check API key
      if (GEMINI_CONFIG.API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
        throw new Error('Please set your Gemini API key in GEMINI_CONFIG');
      }

      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }

      console.log('Original file info:', fileInfo);

      // Compress if needed
      let processedImageUri = imageUri;
      if (fileInfo.size && fileInfo.size > 2 * 1024 * 1024) {
        console.log('Compressing large image...');
        processedImageUri = await compressImage(imageUri);
        
        const compressedInfo = await FileSystem.getInfoAsync(processedImageUri);
        console.log('Compressed file info:', compressedInfo);
      }

      // Read and encode image
      const base64 = await FileSystem.readAsStringAsync(processedImageUri, { 
        encoding: FileSystem.EncodingType.Base64 
      });
      
      // Determine mime type
      let mimeType = 'image/jpeg';
      const lowerUri = processedImageUri.toLowerCase();
      if (lowerUri.includes('.png')) {
        mimeType = 'image/png';
      } else if (lowerUri.includes('.webp')) {
        mimeType = 'image/webp';
      }
      
      console.log('Image details:', { mimeType, base64Length: base64.length });
      
      // Size check
      if (base64.length > 15000000) {
        throw new Error('Image too large after compression. Please use a smaller image.');
      }
      
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.MODEL}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;
      
      // Comprehensive prompt for veterinary analysis matching API endpoints
      const prompt = `You are a veterinary expert analyzing an image of a stray/rescue animal. Examine this image very carefully and provide a comprehensive analysis in JSON format that matches the required API structure.

ANALYSIS INSTRUCTIONS:
- Look closely at the animal's physical condition, posture, environment
- Assess visible injuries, wounds, bleeding, abnormalities
- Evaluate age indicators: size, facial features, coat condition, eyes
- Determine behavior from body language and expression
- Assess urgency based on visible health condition
- Provide specific, actionable care recommendations

Respond with this EXACT JSON structure matching the API endpoints (fill every field with detailed observations):

{
  "title": "Descriptive title based on what you see (e.g., 'Injured Street Dog with Leg Wound', 'Malnourished Kitten with Eye Infection')",
  "description": "Detailed 2-3 sentence description of the animal's condition and situation visible in the image",
  "species": "Use exact terms: 'Canine' for dogs, 'Feline' for cats, 'Avian' for birds, or specific animal type",
  "breed": "Specific breed if identifiable, otherwise 'Unknown' or 'Mixed'",
  "age": "Detailed age estimate with reasoning (e.g., 'Adult (2-4 years) - based on facial maturity and body size', 'Puppy (3-6 months) - small size and juvenile features')",
  "gender": "Male/Female/Unknown - only if anatomical features clearly visible",
  "weight": "Specific estimate based on body condition (e.g., '15-20 kg (appears underweight)', '5-8 kg (normal body condition)', or 'Unknown if not visible')",
  "severity": "Choose based on visible condition: 'Critical' (life-threatening, severe bleeding, unconscious), 'High' (significant injuries, obvious distress), 'Moderate' (visible injuries, some concern), 'Low' (minor issues, stable)",
  "injury_summary": "Detailed description of ALL visible injuries, wounds, abnormalities. Include location, size, type. If none visible, state 'No obvious external injuries visible in this image'",
  "symptoms": ["List ALL visible symptoms as separate items", "Be specific: 'Bleeding from left hind leg', 'Severe limping on right front paw', 'Matted fur with visible dirt', 'Eyes appear discharge', 'Visible ribs indicating malnutrition'"],
  "urgency": "Medical priority: 'Critical' (immediate emergency care), 'High' (care within 2-4 hours), 'Moderate' (care within 24 hours), 'Low' (routine care)",
  "behavior": "Describe behavior from visible cues: 'Calm and alert', 'Scared and defensive', 'Lethargic and weak', 'Aggressive posture', 'Friendly and approachable', etc.",
  "context": "Situation assessment: 'Street Stray', 'Abandoned Pet', 'Lost Pet', 'Wild Animal', 'Injured Rescue', 'Sick Stray'",
  "confidence_score": "Rate overall analysis confidence 1-10 (1-3=Low confidence, 4-6=Medium, 7-8=High, 9-10=Very high). Provide single integer.",
  "care_tips": ["Provide 3-4 specific care recommendations based on visible condition", "Examples: 'Keep wound clean and dry', 'Provide fresh water immediately', 'Handle very gently due to visible injuries', 'Keep animal warm and calm'"],
  "ai_analysis": {
    "severity_score": "Rate severity 1-10 (1-2=Low, 3-4=Moderate, 5-7=High, 8-10=Critical). Provide single integer.",
    "urgency_score": "Rate urgency 1-10 (1-2=Low priority, 3-4=Moderate, 5-7=High, 8-10=Emergency). Provide single integer.",
    "behavior_score": "Rate behavior safety 1-10 (1-3=Dangerous/Aggressive, 4-6=Unpredictable, 7-8=Calm but wary, 9-10=Very safe/friendly). Provide single integer.",
    "age_score": "Rate age assessment confidence 1-10 (1-3=Very uncertain, 4-6=Moderate confidence, 7-8=Good confidence, 9-10=Very certain). Provide single integer.",
    "overall_confidence": "Rate overall analysis confidence 1-10 (1-3=Low confidence, 4-6=Medium, 7-8=High, 9-10=Very high). Provide single integer."
  }
}

CRITICAL REQUIREMENTS:
- Analyze the image thoroughly before responding
- Never leave fields empty - always provide detailed observations
- Base all assessments on actual visible evidence
- Be specific and actionable in recommendations
- Provide integer scores (1-10) for all rating fields
- If truly uncertain about something, explain why in the field
- Respond with ONLY the JSON object, no additional text or markdown`;

      // API request configuration
      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            { 
              inlineData: { 
                mimeType: mimeType, 
                data: base64 
              } 
            }
          ]
        }],
        generationConfig: {
          temperature: GEMINI_CONFIG.TEMPERATURE,
          maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS,
          topP: 0.8,
          topK: 40,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('Sending request to Gemini API...');
      
      // API call with fallback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT);
      
      let response;
      try {
        response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`API returned status ${response.status}: ${errorData}`);
        }
        
        const data = await response.json();
        response = { data, status: response.status };
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        console.log('Fetch failed, trying axios...', fetchError.message);
        
        response = await axios.post(GEMINI_API_URL, requestBody, {
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: GEMINI_CONFIG.TIMEOUT,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          validateStatus: function (status) {
            return status < 500;
          }
        });
      }

      console.log('API Response Status:', response.status);

      if (response.status !== 200) {
        throw new Error(`API error ${response.status}: ${response.data?.error?.message || 'Unknown error'}`);
      }

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No response content from Gemini API');
      }

      console.log('Raw Gemini response:', text);
      
      // Enhanced JSON parsing
      let cleanText = text.trim();
      
      // Remove markdown formatting
      cleanText = cleanText.replace(/```json\n?/gi, '').replace(/```\n?/g, '');
      cleanText = cleanText.replace(/^`+|`+$/g, '');
      
      // Extract JSON object
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('Cleaned JSON text:', cleanText);
      
      let parsedData;
      try {
        parsedData = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        
        // Attempt to fix common JSON issues
        let fixedText = cleanText
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']')
          .replace(/'/g, '"') // Replace single quotes
          .replace(/(\w+):/g, '"$1":'); // Quote object keys
        
        try {
          parsedData = JSON.parse(fixedText);
          console.log('JSON successfully repaired and parsed');
        } catch (secondError) {
          throw new Error('Could not parse JSON response from Gemini API');
        }
      }

      // Validate required fields
      const requiredFields = [
        'title', 'description', 'species', 'age', 'severity', 
        'injury_summary', 'urgency', 'behavior', 'context'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !parsedData[field] || parsedData[field] === '' || parsedData[field] === 'Unknown'
      );
      
      if (missingFields.length > 2) {
        console.warn('Multiple fields missing:', missingFields);
        throw new Error(`Analysis incomplete. Missing critical information: ${missingFields.join(', ')}. Please retry with a clearer image.`);
      }

      // Convert numerical scores to progress values (0.0 to 1.0)
      const severityProgress = parsedData.ai_analysis?.severity_score ? Math.max(0, Math.min(1, parsedData.ai_analysis.severity_score / 10)) : 0.5;
      const urgencyProgress = parsedData.ai_analysis?.urgency_score ? Math.max(0, Math.min(1, parsedData.ai_analysis.urgency_score / 10)) : 0.5;
      const behaviorProgress = parsedData.ai_analysis?.behavior_score ? Math.max(0, Math.min(1, parsedData.ai_analysis.behavior_score / 10)) : 0.5;
      const ageProgress = parsedData.ai_analysis?.age_score ? Math.max(0, Math.min(1, parsedData.ai_analysis.age_score / 10)) : 0.5;
      const aiConfidenceProgress = parsedData.confidence_score ? Math.max(0, Math.min(1, parsedData.confidence_score / 10)) : 0.5;

      // Update state with comprehensive data
      setFields(prevFields => ({
        ...prevFields,
        // Basic information
        title: parsedData.title || prevFields.title,
        description: parsedData.description || prevFields.description,
        species: parsedData.species || prevFields.species,
        age: parsedData.age || prevFields.age,
        gender: parsedData.gender || prevFields.gender,
        weight: parsedData.weight || prevFields.weight,
        
        // Health assessment
        severity: parsedData.severity || prevFields.severity,
        injurySummary: parsedData.injury_summary || prevFields.injurySummary,
        symptoms: Array.isArray(parsedData.symptoms) ? parsedData.symptoms : 
                 typeof parsedData.symptoms === 'string' ? [parsedData.symptoms] : prevFields.symptoms,
        urgency: parsedData.urgency || prevFields.urgency,
        behavior: parsedData.behavior || prevFields.behavior,
        context: parsedData.context || prevFields.context,
        vetTimeline: "Within 2-4 hours", // Default timeline
        
        // AI analysis
        aiConfidence: parsedData.confidence_score ? `${parsedData.confidence_score}/10` : prevFields.aiConfidence,
        
        // Care information
        careTips: Array.isArray(parsedData.care_tips) ? parsedData.care_tips : 
                 typeof parsedData.care_tips === 'string' ? [parsedData.care_tips] : prevFields.careTips,
        actions: ["Contact local rescue", "Document injuries", "Provide immediate care"], // Default actions
        
        // Progress values for card display
        severityProgress,
        urgencyProgress,
        behaviorProgress,
        ageProgress,
        aiConfidenceProgress,
        
        // Preserve metadata
        image: imageUri,
        time: prevFields.time,
        location: prevFields.location,
      }));

      console.log('Analysis completed successfully');

    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      let errorMessage = 'Failed to analyze image. Please try again.';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Analysis timed out. Please check your internet connection and try again.';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid API key. Please check your Gemini API key configuration.';
      } else if (error.response?.status === 403) {
        errorMessage = 'API access forbidden. Check your API key permissions.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Bad request. The image format might not be supported.';
      } else if (error.message?.includes('JSON')) {
        errorMessage = 'Analysis response format error. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [imageUri]);

  // Auto-analyze on mount
  useEffect(() => {
    if (imageUri) {
      fetchGemini();
    }
  }, [imageUri, fetchGemini]);

  // Submit handler - transforms data for the card
  const handleSubmit = () => {
    if (!fields.title || !fields.injurySummary) {
      Alert.alert("Missing Information", "Please ensure the analysis is complete before submitting.");
      return;
    }

    // Prepare data exactly as the API expects it
    const cardData = {
      // Required fields for RescueCase interface
      id: `rescue_${Date.now()}`, // Unique ID
      title: fields.title,
      species: fields.species,
      breed: "Unknown", // Default value
      age: fields.age,
      gender: fields.gender,
      weight: fields.weight,
      severity: fields.severity,
      injurySummary: fields.injurySummary,
      symptoms: fields.symptoms,
      vitals: { 
        temperature: "Unknown", 
        heartRate: "Unknown", 
        breathing: "Unknown" 
      },
      medicalHistory: "No previous records",
      time: fields.time,
      ngo: "Local Rescue",
      volunteer: "Available",
      estimatedCost: "TBD",
      location: fields.location,
      image: fields.image,
      rescueProgress: 0.3, // Default progress
      
      // Additional fields for enhanced display
      urgency: fields.urgency,
      behavior: fields.behavior,
      context: fields.context,
      vetTimeline: fields.vetTimeline,
      
      // Progress values for visual indicators (0.0 to 1.0)
      aiConfidence: fields.aiConfidenceProgress,
      ageProgress: fields.ageProgress,
      severityProgress: fields.severityProgress,
      urgencyProgress: fields.urgencyProgress,
      behaviorProgress: fields.behaviorProgress,
      
      // Additional details
      description: fields.description,
      
      // Care information
      careTips: fields.careTips,
      actions: fields.actions,
      
      // API-specific fields
      report_id: `b1a2c3d4-e5f6-7890-1234-56789abcdef${Date.now()}`,
      user_id: "user_123",
      image_url: fields.image,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      location_string: JSON.stringify({
        latitude: fields.location.latitude,
        longitude: fields.location.longitude,
        address: "Current Location"
      }),
      latitude: fields.location.latitude,
      longitude: fields.location.longitude,
      ngo_assigned: null,
      volunteer_assigned: null,
      ngo_name: null,
      volunteer_name: null,
      confidence_score: Math.round(fields.aiConfidenceProgress * 10),
      care_tips: fields.careTips,
      report_data: {},
      ai_analysis: {
        severity_score: Math.round(fields.severityProgress * 10),
        urgency_score: Math.round(fields.urgencyProgress * 10),
        behavior_score: Math.round(fields.behaviorProgress * 10),
        age_score: Math.round(fields.ageProgress * 10),
        overall_confidence: Math.round(fields.aiConfidenceProgress * 10)
      }
    };
    
    console.log('Submitting card data:', cardData);
    
    // Navigate back with the new rescue data
    navigation.navigate("UserHome", { newRescue: cardData });
  };

  // Retry analysis
  const handleRetry = () => {
    setError(null);
    fetchGemini();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI-Powered Rescue Analysis</Text>
      
      {/* API Configuration Warning */}
      {GEMINI_CONFIG.API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE' && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Please configure your Gemini API key in GEMINI_CONFIG
          </Text>
        </View>
      )}
      
      {/* Image Display */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <Text style={styles.noImageText}>No image selected</Text>
      )}
      
      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Analyzing with veterinary AI...</Text>
          <Text style={styles.loadingSubtext}>This may take up to 90 seconds</Text>
        </View>
      ) : (
        <>
          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button 
                mode="outlined" 
                onPress={handleRetry}
                style={styles.retryButton}
                textColor="#8B4513"
              >
                Retry Analysis
              </Button>
            </View>
          )}
          
          {/* AI Confidence Indicator */}
          {fields.aiConfidence && fields.aiConfidence !== 'Unknown' && (
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>
                🤖 AI Confidence: {fields.aiConfidence} ({Math.round(fields.aiConfidenceProgress * 100)}%)
              </Text>
              <ProgressBar 
                progress={fields.aiConfidenceProgress} 
                color="#388E3C" 
                style={styles.confidenceBar}
              />
            </View>
          )}
          
          {/* Basic Information */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="Title"
              mode="outlined"
              style={styles.input}
              value={fields.title}
              onChangeText={v => setFields(f => ({ ...f, title: v }))}
              theme={{ colors: { primary: "#8B4513" } }}
            />
            
            <TextInput
              label="Description"
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              value={fields.description}
              onChangeText={v => setFields(f => ({ ...f, description: v }))}
              theme={{ colors: { primary: "#8B4513" } }}
            />
            
            <View style={styles.rowContainer}>
              <TextInput
                label="Species"
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
                value={fields.species}
                onChangeText={v => setFields(f => ({ ...f, species: v }))}
                theme={{ colors: { primary: "#8B4513" } }}
              />
              <TextInput
                label="Age"
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
                value={fields.age}
                onChangeText={v => setFields(f => ({ ...f, age: v }))}
                theme={{ colors: { primary: "#8B4513" } }}
              />
            </View>
            
            <View style={styles.rowContainer}>
              <TextInput
                label="Gender"
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
                value={fields.gender}
                onChangeText={v => setFields(f => ({ ...f, gender: v }))}
                theme={{ colors: { primary: "#8B4513" } }}
              />
              <TextInput
                label="Weight"
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
                value={fields.weight}
                onChangeText={v => setFields(f => ({ ...f, weight: v }))}
                theme={{ colors: { primary: "#8B4513" } }}
              />
            </View>
          </View>
          
          {/* Health Assessment */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Health Assessment</Text>
            
            <TextInput
              label="Injury Summary"
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              value={fields.injurySummary}
              onChangeText={v => setFields(f => ({ ...f, injurySummary: v }))}
              theme={{ colors: { primary: "#8B4513" } }}
            />
            
            <View style={styles.assessmentRow}>
              <View style={styles.assessmentItem}>
                <TextInput
                  label="Severity"
                  mode="outlined"
                  style={styles.input}
                  value={fields.severity}
                  onChangeText={v => setFields(f => ({ ...f, severity: v }))}
                  theme={{ colors: { primary: "#8B4513" } }}
                />
                <Text style={styles.scoreText}>Score: {Math.round(fields.severityProgress * 10)}/10</Text>
                <ProgressBar 
                  progress={fields.severityProgress} 
                  color="#D32F2F" 
                  style={styles.progressBar}
                />
              </View>
              
              <View style={styles.assessmentItem}>
                <TextInput
                  label="Urgency"
                  mode="outlined"
                  style={styles.input}
                  value={fields.urgency}
                  onChangeText={v => setFields(f => ({ ...f, urgency: v }))}
                  theme={{ colors: { primary: "#8B4513" } }}
                />
                <Text style={styles.scoreText}>Score: {Math.round(fields.urgencyProgress * 10)}/10</Text>
                <ProgressBar 
                  progress={fields.urgencyProgress} 
                  color="#F9A825" 
                  style={styles.progressBar}
                />
              </View>
            </View>
            
            <View style={styles.rowContainer}>
              <TextInput
                label="Behavior"
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
                value={fields.behavior}
                onChangeText={v => setFields(f => ({ ...f, behavior: v }))}
                theme={{ colors: { primary: "#8B4513" } }}
              />
              <TextInput
                label="Context"
                mode="outlined"
                style={[styles.input, styles.halfWidth]}
                value={fields.context}
                onChangeText={v => setFields(f => ({ ...f, context: v }))}
                theme={{ colors: { primary: "#8B4513" } }}
              />
            </View>
            
            <TextInput
              label="Vet Timeline"
              mode="outlined"
              style={styles.input}
              value={fields.vetTimeline}
              onChangeText={v => setFields(f => ({ ...f, vetTimeline: v }))}
              theme={{ colors: { primary: "#8B4513" } }}
            />
          </View>
          
          {/* Symptoms */}
          {fields.symptoms && fields.symptoms.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Detected Symptoms</Text>
              <View style={styles.symptomsList}>
                {fields.symptoms.map((symptom, index) => (
                  <Text key={index} style={styles.symptomItem}>• {symptom}</Text>
                ))}
              </View>
            </View>
          )}
          
          {/* Care Tips */}
          {fields.careTips && fields.careTips.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🩺 Care Recommendations</Text>
              <View style={styles.tipsList}>
                {fields.careTips.map((tip, index) => (
                  <Text key={index} style={styles.tipItem}>💡 {tip}</Text>
                ))}
              </View>
            </View>
          )}
          
          {/* Immediate Actions */}
          {fields.actions && fields.actions.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>⚡ Immediate Actions</Text>
              <View style={styles.actionsList}>
                {fields.actions.map((action, index) => (
                  <Text key={index} style={styles.actionItem}>🎯 {action}</Text>
                ))}
              </View>
            </View>
          )}
          
          {/* Submit Button */}
          <Button
            mode="contained"
            style={styles.submitButton}
            buttonColor="#8B4513"
            onPress={handleSubmit}
          >
            Submit Rescue Report
          </Button>
        </>
      )}
    </ScrollView>
  );
}

// ========================
// 🧾 STYLES
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF8F0",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#5D4037",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 16,
  },
  noImageText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginVertical: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#5D4037",
    marginTop: 8,
    fontWeight: "500",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
  },
  retryButton: {
    borderColor: "#D32F2F",
  },
  confidenceContainer: {
    marginBottom: 20,
  },
  confidenceText: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "600",
    color: "#2E7D32",
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#6D4C41",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  assessmentRow: {
    flexDirection: "row",
    gap: 16,
  },
  assessmentItem: {
    flex: 1,
  },
  scoreText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  symptomsList: {
    paddingLeft: 8,
  },
  symptomItem: {
    fontSize: 14,
    marginBottom: 4,
    color: "#4E342E",
  },
  tipsList: {
    paddingLeft: 8,
  },
  tipItem: {
    fontSize: 14,
    marginBottom: 4,
    color: "#2E7D32",
  },
  actionsList: {
    paddingLeft: 8,
  },
  actionItem: {
    fontSize: 14,
    marginBottom: 4,
    color: "#F57C00",
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  warningContainer: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  warningText: {
    color: "#856404",
    fontWeight: "600",
    fontSize: 14,
  },
});
