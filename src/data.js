import {RELEASE} from './release.js';

export const ITEMS=[
 {t:"IMG",n:"IMG-20260412-WA0031.jpg",s:"2.4 MB",g:"linear-gradient(160deg,#3a4a3f,#141a16 70%)",sh:"radial-gradient(circle at 70% 30%,#e8d9a8 0 9%,transparent 10%)"},
 {t:"VID",n:"VID-20260301-WA0007.mp4",s:"38.1 MB",g:"linear-gradient(200deg,#46344d,#15101a 70%)",sh:""},
 {t:"IMG",n:"IMG-20251230-WA0102.jpg",s:"1.1 MB",g:"linear-gradient(140deg,#4d3a30,#1a1411 70%)",sh:"linear-gradient(transparent 60%,#0006)"},
 {t:"VID",n:"VID-20260118-WA0044.mp4",s:"12.7 MB",g:"linear-gradient(180deg,#2f3f52,#10151b 70%)",sh:""},
 {t:"IMG",n:"IMG-20260209-WA0018.jpg",s:"3.8 MB",g:"linear-gradient(120deg,#52483a,#17140f 70%)",sh:"radial-gradient(circle at 30% 65%,#ffffff22 0 20%,transparent 21%)"},
 {t:"IMG",n:"IMG-20250921-WA0009.jpg",s:"0.9 MB",g:"linear-gradient(210deg,#3a3f52,#101118 70%)",sh:""}
];

export const FAQ=[
 ["What does the app do?","It scans accessible WhatsApp images and videos, lets you review them one at a time with swipes, and queues the ones you don't want so you can delete them and free up space."],
 ["Does it upload my photos?","It's designed to work locally with no account or cloud upload. If you want certainty, inspect the source (when published) and check your network activity."],
 ["Does it delete images automatically?","No. Swiping left only marks an item. You review the queue, then confirm through Android's authorization flow."],
 ["Why does Android request media permissions?","Android gates access to images and videos behind permissions. The app needs them to list the WhatsApp media you can review and to request deletion."],
 ["How do I install the APK?","Download it, open it, and allow installs from your browser or file manager if Android asks. Steps differ by Android version and device."],
 ["What should I do if installation is blocked?","Open Settings, find the install-unknown-apps setting for the app you downloaded with, and allow it for this install. Some devices also have Play Protect prompts you can review."],
 ["How do I verify the APK's checksum?","Compare the SHA-256 listed above with your file's hash. On Linux or macOS run sha256sum file.apk, on Windows PowerShell run Get-FileHash file.apk. They should match exactly."],
 ["How can I report a bug?",RELEASE.repoUrl||RELEASE.support?"Use the issue or support link in the download section.":"No issue tracker or support contact has been published yet. It will appear in the download section when configured."]
];
