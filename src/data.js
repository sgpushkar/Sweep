import { RELEASE } from './release.js';

export const SAMPLE_MEDIA = [
  {
    id: "WA0031",
    name: "IMG-20260412-WA0031.jpg",
    type: "Forwarded Photo",
    size: "3.4 MB",
    origin: "Forwarded 4 times · Family Group",
    timestamp: "Today, 08:14 AM",
    image: "/media/morning.jpg",
    previewBg: "#1a1812",
    previewAccent: "#f59e0b",
    aspect: "4/3",
    caption: "Good morning wishes with floral glitter & coffee",
    recommended: "discard"
  },
  {
    id: "WA0007",
    name: "VID-20260301-WA0007.mp4",
    type: "Forwarded Video (2:15)",
    size: "48.2 MB",
    origin: "Forwarded many times · Neighborhood Chat",
    timestamp: "Yesterday, 02:40 PM",
    image: "/media/puppy_video.jpg",
    isVideo: true,
    previewBg: "#121b18",
    previewAccent: "#10b981",
    aspect: "16/9",
    caption: "Trampoline puppy viral video circulating in 4 groups",
    recommended: "discard"
  },
  {
    id: "WA0018",
    name: "IMG-20260408-WA0018.jpg",
    type: "Camera Photo",
    size: "4.8 MB",
    origin: "Direct Chat · Sarah",
    timestamp: "08 Apr 2026 · 06:45 PM",
    image: "/media/family.jpg",
    previewBg: "#1a1518",
    previewAccent: "#ec4899",
    aspect: "4/3",
    caption: "Sunset family portrait at the beach vacation",
    recommended: "keep"
  },
  {
    id: "WA0102",
    name: "IMG-20251230-WA0102.jpg",
    type: "Screenshot",
    size: "2.1 MB",
    origin: "Dinner Split Group",
    timestamp: "30 Dec 2025 · 09:22 PM",
    image: "/media/receipt.jpg",
    previewBg: "#16171d",
    previewAccent: "#6366f1",
    aspect: "3/4",
    caption: "The Oakwood Bistro restaurant receipt already settled",
    recommended: "discard"
  }
];

export const EDITORIAL_FAQ = [
  {
    q: "Why an APK download instead of the Google Play Store?",
    a: "Google Play now heavily restricts apps that manage files outside their own sandbox. Under recent Play policies, declaring file-management access for targeted utility deletion creates endless policy hurdles. Distributing an open, signed standalone APK directly allows Sweep to use Android's official MediaStore APIs without ad SDKs, analytics frameworks, or account requirements."
  },
  {
    q: "Does swiping delete files immediately?",
    a: "No. Swiping is strictly a sorting action. When you swipe left, the file is placed into a local staging queue. Nothing leaves your phone until you review the queue and trigger Android's native system dialog (MediaStore.createDeleteRequest). The Android operating system itself confirms with you before any byte is modified."
  },
  {
    q: "Can the app see my WhatsApp messages or contacts?",
    a: "Never. Sweep has no contact access, no message access, no camera access, and zero network access permissions in its manifest. It queries only the public Android MediaStore index for images and videos with 'WhatsApp' in their relative storage path."
  },
  {
    q: "How do I handle the 'Unknown app' warning when installing?",
    a: "When you open a downloaded APK, Android asks you to grant 'Install unknown apps' permission to your browser (Chrome/Firefox/Samsung Internet). Tap 'Settings' in that prompt and toggle the switch. If Google Play Protect shows a verification card, tap 'More details' → 'Install anyway'. Sweep is signed with a verifiable cryptographic certificate and the SHA-256 hash is published on this page."
  },
  {
    q: "What happens if I make a mistake while swiping?",
    a: "Every card has an instant undo button (or press Z / Backspace on desktop). You can also uncheck individual files in the final queue screen before confirming deletion."
  }
];
