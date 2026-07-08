# 🧠 EmotionSense v2 — Master System Blueprint

## 1. Project Overview

**EmotionSense** is a multimodal emotionally-aware conversational AI agent designed to understand a user's emotional state through multiple channels of communication and adapt its responses accordingly.

Unlike traditional chatbots that only rely on textual conversation, EmotionSense perceives emotions from:

* **Text** — understanding emotions expressed in written language.
* **Voice** — analyzing speech content and vocal characteristics such as tone, pitch, and energy.
* **Facial expressions** — interpreting visual cues from the user's face.

The system maintains an evolving emotional understanding of the user over time, allowing conversations to become more personalized, context-aware, and emotionally adaptive.

The final product is a publicly deployed web-based AI companion with a natural conversational interface, designed to serve as a personal emotional support and conversational agent.

---

# 2. Core Objective

The goal of EmotionSense is to bridge the gap between human emotional communication and AI conversation by creating an agent that can:

* Understand emotion from multiple human communication modalities.
* Maintain both short-term and long-term emotional context.
* Generate responses that consider not only what the user says but also how they feel.
* Provide a more empathetic and personalized conversational experience.
* Serve as a reliable, always-available emotional companion.

---

# 3. High-Level System Architecture

The system is divided into five major components:

```
                 User Interaction
                        |
      -------------------------------------
      |                 |                 |
    Text (transcribed) Audio             Face
      |<----------------|                 |
 RoBERTa Emotion   Speech Processing  Facial Emotion
   Classifier      + Audio Emotion       Model
 (GoEmotions-28)   (Wav2Vec2-SER)    (deferred)
      |                 |                 |
      -------------------------------------
                        |
                Emotion Fusion Layer
                  (canonical 8-class)
                        |
                Current Emotion State
                        |
                  Memory Module
             (short-term + long-term)
                        |
          Emotional Context Representation
                        |
                 LLM Response Engine
              (Llama 3.1 8B Instruct)
                        |
              Personalized Reply + TTS
```

### Canonical Emotion Taxonomy (locked — 8 classes)

All modalities map to this shared label space:

| ID | Label | Notes |
|----|-------|-------|
| 0 | neutral | |
| 1 | happy | Covers excitement, joy, amusement etc. |
| 2 | sad | |
| 3 | angry | |
| 4 | fear | |
| 5 | disgust | |
| 6 | surprise | |
| 7 | frustration | Distinct from angry — kept for acoustic reasons |

Mappings for all modalities (GoEmotions-28, RAVDESS, CREMA-D, IEMOCAP) are versioned in `backend/common/configs/label_mapping.yaml` as the single source of truth.

---

# 4. Input Layer — Multimodal Data Acquisition

### Text Input

* Traditional typed chat messages.
* Sent to the text emotion recognition module and the LLM.
* Also used for transcribed voice input — voice is the primary modality.

### Audio Input

Voice input serves two parallel purposes:

1. **Speech-to-text** — Whisper-base converts spoken language into text for the LLM.
2. **Speech emotion recognition** — Wav2Vec2-SER extracts emotional cues from vocal properties (pitch, energy, tone, speaking rate).

Voice is the **primary interaction modality**. The keyboard input is optional and toggled explicitly by the user.

### Facial Input

The webcam stream is processed periodically to identify facial expressions. When active, the camera feed is shown in the UI with a live emotion overlay badge. The face module is currently deferred pending model development.

---

# 5. Emotion Understanding Layer

Each modality acts as an independent emotional sensor. All outputs follow a standardized schema:

```json
{
  "native_emotion": "joy",
  "canonical_emotion": "happy",
  "confidence": 0.85,
  "all_scores": { ... }
}
```

`canonical_emotion` drives the UI and fusion layer. `native_emotion` is preserved for research and debugging.

### Text Module

* Model: `PushkarOM/roberta-head-goemotion` (RoBERTa fine-tuned on GoEmotions-28)
* Returns 28-class native label mapped to canonical 8-class via `label_mapping.yaml`
* Used as semantic signal in voice mode (informational), primary signal in text-only mode
* Known limitation: neutral-text bias on scripted/acted speech corpora

### Audio Module

* Model: `PushkarOM/wav2vec2-ser-v1` (Wav2Vec2-base fine-tuned on RAVDESS + CREMA-D + IEMOCAP)
* Trained on 16,411 clips, 8 canonical classes, speaker-disjoint splits
* Test weighted F1: 0.635
* **Primary emotion signal in voice mode**
* Native labels are already canonical — native_emotion == canonical_emotion
* Next planned version: `wav2vec2-ser-v4` (cross-attention intermediate fusion)

### Face Module

* Deferred pending model development
* Camera feed is wired in frontend with emotion overlay badge placeholder
* Will follow same standardized schema on integration

---

# 6. Emotion Fusion Layer

The fusion layer combines information from all available modalities into a single canonical emotion state.

### Current State (working demo)

* **Voice mode**: acoustic emotion (Wav2Vec2) is the primary signal. Semantic (RoBERTa on transcript) is informational only — passed to LLM as context but does not affect `current_emotion`.
* **Text mode**: semantic emotion (RoBERTa) is the primary signal.
* **Disagreement flag**: set when `acoustic.canonical_emotion != semantic.canonical_emotion`. Passed explicitly to the LLM to allow it to reason about masked or suppressed emotion.

### Research Findings (from `emotion-ai-research` repo)

| Strategy | Weighted F1 | vs Acoustic-only |
|---|---|---|
| Acoustic-only (v1 baseline) | 0.6357 | — |
| Late fusion, best fixed weights (0.8/0.2) | 0.6357 | 0.000 |
| Dynamic confidence weighting | 0.4971 | -0.139 |

Late fusion does not improve over acoustic-only on scripted speech corpora. Dynamic weighting actively degrades performance due to 79.3% modality disagreement driven by semantic neutral-text bias. Intermediate fusion (v4, cross-attention) is the next planned strategy.

### Planned Fusion Evolution

* **v4**: cross-attention intermediate fusion (joint training, currently in research)
* **v5**: domain-adapted semantic model or multimodal contrastive pretraining
* **3-modality**: audio + face + text fusion design informed by audio-only findings

---

# 7. Emotional Memory Module

Human emotions are not isolated moments. They evolve over time.

### Short-term Memory (session-level) — planned next

* Rolling window of recent turns (configurable, default 10)
* Stores: message, detected emotion, confidence, timestamp, modality sources
* Passed as context to LLM for emotional progression awareness
* Example: `Frustrated → Confused → Relieved` informs the LLM that the user's state is improving

### Long-term Memory (cross-session) — future

* Persistent emotional profile developed over multiple sessions
* Stores: emotional patterns, frequently observed states, emotional trends over time
* Backed by PostgreSQL (structured history) + optional vector store (semantic retrieval)
* Enables the agent to recognize patterns like recurring stress, gradual mood improvement etc.
* Purpose is not to assign a fixed personality but to improve future interaction quality

---

# 8. LLM Response Generation Layer

The LLM receives an enriched context, not just the raw user message:

* User message (text or voice transcript)
* Current canonical emotion + confidence
* Acoustic emotion (voice mode)
* Semantic emotion (informational)
* Disagreement flag (possible masked/suppressed emotion)
* Short-term emotional history (planned)
* Relevant long-term emotional patterns (future)

### Current Prompt Strategy

Emotional context is passed as bracketed metadata. The LLM is instructed to use it implicitly — adapting tone, empathy level, and conversational strategy — without explicitly labeling or announcing the user's emotion in the response.

### TTS Layer (planned)

Emotion-aware text-to-speech converting responses to voice output with adaptive prosody (tone, pitch, speed) aligned with both user emotion and response context. The Speaking Orb in the frontend will react to TTS audio amplitude in real time.

---

# 9. Frontend System — React

Stack: React + Vite + pnpm, shadcn/ui (Base/Nova), Tailwind v4, Geist font.

Design: clean light/dark clinical UI with indigo accent (OKLCH color system). Voice is the primary interaction modality.

### Layout

Two-column desktop layout:

**Left panel:**
* Jarvis-style Speaking Orb (reacts to TTS audio when speaking, idle breathing animation otherwise)
* Chat transcript (voice transcriptions + AI replies)
* Bottom bar: mic always-on status indicator, camera toggle, keyboard toggle

**Right panel:**
* Emotion indicator orb (current canonical emotion + confidence %)
* Modality status badges (Text / Voice / Face — active/inactive)
* Emotion history timeline (horizontal, color-coded dots with confidence weighting, hover tooltips)

### Voice Interface

* Always-on VAD (energy-threshold based, configurable)
* `MediaRecorder` → WebM → ffmpeg conversion on backend → 16kHz mono WAV
* Transcript shown in chat, acoustic emotion drives orb and history
* Keyboard input hidden by default, toggled explicitly

### Camera Interface

* Toggleable webcam feed shown in left panel when active
* Emotion overlay badge (live once face model integrated)
* Camera release properly handled on toggle-off

---

# 10. Backend System — Python

Stack: FastAPI, PyTorch (CUDA), Hugging Face Transformers, Whisper, torchaudio, soundfile, ffmpeg.

### Directory Structure

```
backend/
├── api/
│   └── routes/
│       ├── health.py
│       ├── chat.py
│       ├── audio.py
│       └── emotion.py
├── services/
│   ├── text_emotion/
│   │   ├── classifier.py      # RoBERTa GoEmotions pipeline
│   │   ├── labels.py          # LABEL_N → GoEmotions name mapping
│   │   └── canonical.py       # GoEmotions → canonical via label_mapping.yaml
│   ├── audio_emotion/
│   │   ├── ser.py             # Wav2Vec2 SER inference
│   │   └── transcriber.py     # Whisper transcription
│   ├── llm/
│   │   └── generator.py       # HF Inference API (Llama 3.1 8B Instruct)
│   └── orchestrator.py        # Coordinates all modules, builds emotion state
├── fusion/                    # Placeholder — fusion logic planned here
├── memory/                    # Placeholder — memory module planned here
├── database/                  # Placeholder — DB layer planned here
├── common/
│   └── configs/
│       └── label_mapping.yaml # Single source of truth for all label mappings
└── core/
    └── config.py              # Pydantic settings, loaded from .env
```

### API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Server status |
| `/chat` | POST | Text mode — classify emotion + generate reply |
| `/audio/analyze` | POST | Voice mode — transcribe + SER + classify + generate reply |
| `/emotion/analyze/text` | POST | Standalone text emotion classification |
| `/emotion/state` | GET | Current fused emotion state (stub — planned) |

### Standard Modality Output Schema

```json
{
  "native_emotion": "joy",
  "canonical_emotion": "happy",
  "confidence": 0.85,
  "all_scores": { "joy": 0.85, "excitement": 0.10, ... }
}
```

### Audio Endpoint Response Schema

```json
{
  "current_emotion": "happy",
  "confidence": 0.82,
  "transcript": "...",
  "acoustic": { "native_emotion": "happy", "canonical_emotion": "happy", ... },
  "semantic": { "native_emotion": "curiosity", "canonical_emotion": "neutral", ... },
  "disagreement": true,
  "sources": { "text": null, "audio": "happy", "face": null },
  "reply": "..."
}
```

---

# 11. Infrastructure & Deployment

### Security

* API key authentication (header-based) for all endpoints
* Rate limiting per IP (`slowapi`)
* CORS locked to specific origins in production
* Environment secrets managed via `.env` (never committed)
* HF token scoped to minimum required permissions

### Deployment Stack (planned)

* **Containerization**: Docker + Docker Compose (frontend + backend + DB)
* **Cloud**: AWS / GCP / VPS (GPU instance for inference)
* **Reverse proxy**: Nginx
* **SSL**: Let's Encrypt
* **CI/CD**: GitHub Actions

### Database (planned)

* **PostgreSQL**: user sessions, conversation history, emotional timeline
* **Vector store** (optional, future): semantic retrieval of emotional memories

### Model Loading

* Eager loading at startup via FastAPI `lifespan` — all models loaded once on server start, zero cold start on first user request

---

# 12. Development Roadmap & Phase Planning

EmotionSense is developed as a complete V2 architecture from the start. The philosophy is:

> **Design the complete system first, then progressively replace placeholders with fully functional modules.**

---

## Phase 0 — System Design & Repository Architecture ✅

* Full directory structure established
* Frontend and backend scaffolded
* All placeholder modules in place

---

## Phase 1 — Core Pipeline (Text + LLM) ✅

* RoBERTa GoEmotions text classifier integrated (`PushkarOM/roberta-head-goemotion`)
* Llama 3.1 8B Instruct via HF Inference API integrated
* `/chat` endpoint working end-to-end
* Canonical label mapping system implemented (`label_mapping.yaml` as single source of truth)
* Emotion orchestrator (`process_text`) established

---

## Phase 2 — Frontend ✅

* Two-panel layout (chat + emotion visualization)
* Speaking Orb (Jarvis-style, idle + speaking states)
* Emotion indicator orb with confidence %
* Modality status badges
* Emotion history timeline (horizontal, color-coded, hover tooltips)
* VAD-based voice capture (`useVoiceCapture` hook)
* Camera feed with emotion overlay placeholder
* Light/dark mode (OKLCH indigo/cool clinical palette)
* Bottom bar (mic status, camera toggle, keyboard toggle)
* Full frontend ↔ backend connection verified

---

## Phase 3 — Audio Emotion Module ✅

* Wav2Vec2-SER (`PushkarOM/wav2vec2-ser-v1`) integrated
* Whisper-base transcription integrated
* ffmpeg audio conversion pipeline (WebM → 16kHz mono WAV)
* VAD energy threshold tuned
* Disagreement flag passed to LLM
* `/audio/analyze` endpoint working end-to-end
* Acoustic emotion drives UI; semantic emotion informational only

---

## Phase 3.5 — Audio Model Research (in progress, separate repo)

Research in `emotion-ai-research` repo:

* v1: Wav2Vec2-base acoustic-only — test F1: 0.635 ✅
* v2: Late fusion fixed weights — no improvement over acoustic-only ✅
* v3: Dynamic confidence weighting — degrades performance (-0.139 F1) ✅
* **v4: Cross-attention intermediate fusion — in progress**
* v5: Proposed improvement (domain adaptation / contrastive pretraining) — planned

When v4 is complete and pushed to HuggingFace Hub, EmotionSense integrates it via a single config change (`AUDIO_EMOTION_MODEL_ID` in `.env`).

---

## Phase 4 — Facial Emotion Module (planned)

* Face emotion model development (separate research track, versioned v1→v5)
* Integration into `backend/services/face_emotion/`
* Camera feed emotion overlay badge goes live
* Fusion layer updated for 3-modality input

---

## Phase 5 — Memory Module (planned)

### Short-term (session-level)
* Rolling window of last N turns with emotion state
* Passed to LLM as structured context
* Stored in-memory per session

### Long-term (cross-session)
* PostgreSQL-backed emotional history
* User sessions, conversation logs, emotion timelines
* LLM receives summarized emotional patterns from past sessions

---

## Phase 6 — Auth, Infrastructure & Deployment (planned)

* User authentication (JWT-based)
* PostgreSQL database layer
* Docker containerization
* Cloud deployment (GPU instance)
* Eager model loading at startup
* Rate limiting and abuse prevention
* CORS and API key hardening
* CI/CD pipeline

---

## Phase 7 — TTS & Speaking Orb (planned)

* Emotion-aware TTS model selection
* Speaking Orb reacts to real TTS audio amplitude (replaces simulated amplitude)
* Prosody adapted to user emotional state and response context

---

## Phase 8 — Fusion Research & Evaluation (planned)

Once all modalities are functional and system is deployed:

### Fusion Experiments
* Confidence-based weighting
* Learned weighting
* Attention-based multimodal fusion
* Temporal emotion modeling

### Evaluation Framework (A/B)

| System | Pipeline |
|---|---|
| Baseline A | User → LLM → Response |
| System B | User → Text Emotion → LLM |
| System C | User → Text + Audio + Face → LLM |
| System D | User → Multimodal + Memory → LLM |

Metrics: empathy, personalization, response appropriateness, user preference, emotional alignment.

---

# 13. Research Motivation and Potential Contribution

The main research question:

> **Can explicit multimodal emotional state modeling and persistent affective memory improve the quality, empathy, and personalization of LLM-based conversational agents?**

Modern LLMs have key limitations:

* They rely primarily on linguistic information — no access to vocal tone or facial expression.
* Emotional understanding is implicit, not explicitly modeled as a persistent state.
* They do not maintain a structured history of the user's emotional evolution.

EmotionSense addresses these by introducing an external emotional intelligence layer alongside the LLM.

### Contribution 1 — Multimodal Emotion Perception

Combines what the user says, how they say it, and what they express visually — approximating human emotional communication more closely than text-only systems.

### Contribution 2 — Persistent Affective Memory

Maintains an evolving emotional history across turns and sessions, enabling the agent to reason about emotional trends and patterns over time rather than treating each turn in isolation.

### Contribution 3 — Controlled Emotional Conditioning of LLMs

Provides explicit emotional context to the LLM as structured input rather than relying on implicit inference. This produces more consistent, controllable, and potentially more empathetic responses.

### Key Research Findings (to date)

* Neither fixed nor dynamic late fusion improves over acoustic-only on scripted speech corpora — motivates intermediate fusion.
* 79.3% modality disagreement rate on test set reflects scripted-speech corpus characteristic (neutral text, emotional prosody) rather than model failure.
* Modality disagreement itself is a meaningful signal — may indicate masked or suppressed emotion. Currently surfaced explicitly to the LLM.

### Research Questions

* Does multimodal emotion information produce better conversational responses than text-only systems?
* Does emotional memory improve perceived personalization in long-term conversations?
* Which modality contributes most to accurate emotional understanding?
* What is the optimal fusion strategy — and does it vary across emotion classes and speaking styles?
* When acoustic and semantic signals disagree, what does that reveal about the user's emotional state?

### Possible Paper Titles

* **"EmotionSense: A Multimodal Affective Memory Framework for Emotionally Adaptive LLM-Based Conversational Agents"**
* **"Beyond Text: Integrating Multimodal Emotion Recognition and Affective Memory for Personalized AI Conversations"**
* **"Persistent Emotional State Modeling for Adaptive Human–AI Interaction"**

---

# 14. Overall Vision

EmotionSense is not trying to replace the reasoning ability of modern LLMs.

It aims to provide them with a **human-like emotional perception and memory system**, enabling AI agents to understand not only the meaning of a conversation but the emotional journey behind it.

The product vision is a publicly deployed, always-available emotional companion that gets to know its users over time — not through what they say alone, but through how they feel when they say it.

---

# 15. Currently Going On

## Completed

- [x] Phase 0 — Directory structure, repo architecture
- [x] Phase 1 — Text emotion (RoBERTa GoEmotions) + LLM (Llama 3.1 8B) end-to-end
- [x] Phase 2 — Full frontend (layout, orbs, emotion viz, VAD, camera, dark mode)
- [x] Phase 3 — Audio emotion (Wav2Vec2-SER v1) + Whisper transcription end-to-end
- [x] Canonical label taxonomy + label_mapping.yaml as single source of truth
- [x] Disagreement flag in orchestrator + LLM prompt
- [x] Emotion history timeline in frontend
- [x] VAD threshold tuning (ghost response issue resolved)
- [x] LLM prompt improved (implicit emotional conditioning, no explicit labeling)
- [x] Audio model research: v1 acoustic-only, v2 late fusion fixed, v3 dynamic weights (all evaluated)

## In Progress

- [ ] Audio model v4 — cross-attention intermediate fusion (separate `emotion-ai-research` repo)

## Up Next (backend)

- [ ] Eager model loading at startup (lifespan event)
- [ ] Short-term conversation memory (rolling window → LLM context)
- [ ] `/emotion/state` endpoint — real persistent fused state
- [ ] Basic API key auth + rate limiting
- [ ] PostgreSQL session layer (foundation for long-term memory)

## Up Next (frontend)

- [ ] Processing/thinking state indicator on Speaking Orb
- [ ] VAD amplitude waveform visualization in bottom bar
- [ ] Mobile layout

## Up Next (infrastructure)

- [ ] Docker containerization
- [ ] Cloud deployment with GPU instance
- [ ] CI/CD pipeline

## Deferred

- [ ] Phase 4 — Face emotion model (pending research)
- [ ] Phase 7 — TTS + real Speaking Orb audio reactivity
- [ ] Phase 8 — Full fusion research + evaluation framework
- [ ] Long-term memory (cross-session emotional profile)
