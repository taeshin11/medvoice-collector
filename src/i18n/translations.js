const translations = {
  ko: {
    // Header
    newPatient: '+ 새 환자',
    export: '내보내기',
    settings: '설정',

    // Settings
    claudeApiKey: 'Claude API Key (의학 용어 변환)',
    whisperApiKey: 'OpenAI API Key (iOS 음성인식 Whisper)',
    apiKeyNote: 'API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.',

    // Transcript
    realTimeConversation: '실시간 대화',
    transcriptPlaceholder: '음성 인식을 시작하면 대화 내용이 여기에 표시됩니다...',
    startRecording: '음성 인식 시작',
    pause: '일시정지',
    resume: '재개',
    stopAndConvert: '중지 및 AI 변환',
    converting: 'AI가 의학 용어로 변환 중...',
    iosMode: 'iOS 모드: Whisper API 사용 중',

    // Table
    patientDataTable: '환자 데이터 테이블',
    deletePatient: '환자 삭제',

    // Patient tabs
    patientList: '환자 목록:',
    addPatient: '새 환자 추가',

    // Footer
    builtBy: 'Built by',
    visitors: 'visitors',

    // Export
    excelExport: '.xlsx (엑셀)',
    csvExport: '.csv',
    clipboardCopy: '클립보드 복사',

    // Feedback
    sendFeedback: '피드백 보내기',
    feedbackTitle: '피드백 보내기',
    feedbackPlaceholder: '의견이나 개선 사항을 알려주세요...',
    cancel: '취소',
    send: '전송',

    // Toast messages
    conversionComplete: 'AI 변환 완료!',
    conversionFailed: 'AI 변환 실패: ',
    setApiKey: 'Claude API 키를 설정해주세요',
    minOnePatient: '최소 1명의 환자가 필요합니다',
    xlsxDownloaded: 'XLSX 다운로드 완료!',
    csvDownloaded: 'CSV 다운로드 완료!',
    copiedToClipboard: '클립보드에 복사 완료!',
    feedbackSent: '감사합니다! 피드백이 전달되었습니다',
    micDenied: '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크를 허용해주세요.',
    sttError: '음성 인식 오류: ',

    // Pages
    home: '홈',
    about: '소개',
    howToUse: '사용법 & FAQ',
    privacy: '개인정보처리방침',
    terms: '이용약관',

    // About page
    aboutTitle: 'MedVoice Collector 소개',
    aboutContent: `MedVoice Collector는 SPINAI에서 개발한 AI 기반 음성 의료 데이터 수집 도구입니다.

의사와 환자의 대화를 실시간으로 인식하고, AI가 자동으로 의학 용어로 변환하여 엑셀형 데이터베이스에 채워줍니다.

**누구를 위한 도구인가요?**
- 회진(Rounding) 또는 외래(Outpatient) 진료 중인 전공의/전문의
- 진료 기록을 효율적으로 작성하고 싶은 의료진
- PA(Physician Assistant), 간호사, 의대 실습생

**어떤 문제를 해결하나요?**
진료 중 환자의 구어체 표현("오른쪽 윗배가 아파요")을 의학 용어(RUQ pain)로 변환하고 기록하는 작업을 AI가 자동으로 처리합니다. 의사는 환자와의 대화에만 집중할 수 있습니다.

**핵심 기술**
- Web Speech API를 활용한 실시간 음성 인식 (음성 파일 저장 없음 - 환자 프라이버시 보호)
- Anthropic Claude AI를 통한 context-aware 의학 용어 변환
- iOS Safari에서는 OpenAI Whisper API로 자동 폴백
- PWA 지원으로 네이티브 앱처럼 사용 가능`,

    // How to use page
    howToUseTitle: '사용 방법 & 자주 묻는 질문',
    step1Title: '1단계: API 키 설정',
    step1Content: '우측 상단 설정(톱니바퀴) 버튼을 클릭하고 Claude API 키를 입력합니다. iOS 사용자는 OpenAI API 키도 입력해주세요.',
    step2Title: '2단계: 음성 인식 시작',
    step2Content: '파란색 마이크 버튼을 탭하면 실시간 음성 인식이 시작됩니다. 환자와 자연스럽게 대화하세요.',
    step3Title: '3단계: AI 변환 & 내보내기',
    step3Content: '빨간색 중지 버튼을 누르면 AI가 대화 내용을 의학 용어로 자동 변환합니다. 결과를 검토한 후 엑셀, CSV, 또는 클립보드로 내보내세요.',

    faqTitle: '자주 묻는 질문 (FAQ)',
    faq: [
      { q: 'MedVoice Collector는 무료인가요?', a: '네, 현재 MVP 단계에서 완전히 무료입니다. 사용자가 직접 Claude API 키를 입력하여 사용하며, 저희 서버를 통한 비용은 발생하지 않습니다.' },
      { q: '환자 음성 데이터는 어디에 저장되나요?', a: '음성 파일은 일절 저장되지 않습니다. Web Speech API는 브라우저 내에서만 처리되며, 텍스트 변환 결과만 로컬 브라우저(localStorage)에 저장됩니다. 서버로 전송되는 데이터는 없습니다.' },
      { q: 'iOS Safari에서도 사용할 수 있나요?', a: '네! iOS Safari는 Web Speech API를 지원하지 않기 때문에 자동으로 OpenAI Whisper API로 전환됩니다. 설정에서 OpenAI API 키를 입력하면 됩니다.' },
      { q: '어떤 진료과에서 사용할 수 있나요?', a: '현재 외과/내과 기준으로 최적화되어 있지만, 대부분의 진료과에서 사용 가능합니다. 추후 진료과별 커스텀 사전 기능이 추가될 예정입니다.' },
      { q: 'API 키는 안전한가요?', a: 'API 키는 브라우저의 localStorage에만 저장되며, 어떤 외부 서버로도 전송되지 않습니다. 브라우저를 닫아도 유지되지만, 다른 기기에서는 접근할 수 없습니다.' },
    ],

    // Privacy
    privacyTitle: '개인정보처리방침',
    // Terms
    termsTitle: '이용약관',
  },

  en: {
    // Header
    newPatient: '+ New Patient',
    export: 'Export',
    settings: 'Settings',

    // Settings
    claudeApiKey: 'Claude API Key (Medical Term Conversion)',
    whisperApiKey: 'OpenAI API Key (iOS Speech Recognition)',
    apiKeyNote: 'API keys are stored only in your browser and never sent externally.',

    // Transcript
    realTimeConversation: 'Real-time Conversation',
    transcriptPlaceholder: 'Start voice recognition to see the conversation here...',
    startRecording: 'Start voice recognition',
    pause: 'Pause',
    resume: 'Resume',
    stopAndConvert: 'Stop & AI Convert',
    converting: 'AI is converting to medical terms...',
    iosMode: 'iOS Mode: Using Whisper API',

    // Table
    patientDataTable: 'Patient Data Table',
    deletePatient: 'Delete patient',

    // Patient tabs
    patientList: 'Patients:',
    addPatient: 'Add new patient',

    // Footer
    builtBy: 'Built by',
    visitors: 'visitors',

    // Export
    excelExport: '.xlsx (Excel)',
    csvExport: '.csv',
    clipboardCopy: 'Copy to Clipboard',

    // Feedback
    sendFeedback: 'Send Feedback',
    feedbackTitle: 'Send Feedback',
    feedbackPlaceholder: 'Share your suggestions or improvements...',
    cancel: 'Cancel',
    send: 'Send',

    // Toast messages
    conversionComplete: 'AI conversion complete!',
    conversionFailed: 'AI conversion failed: ',
    setApiKey: 'Please set your Claude API key',
    minOnePatient: 'At least one patient is required',
    xlsxDownloaded: 'XLSX downloaded!',
    csvDownloaded: 'CSV downloaded!',
    copiedToClipboard: 'Copied to clipboard!',
    feedbackSent: 'Thank you! Your feedback has been sent.',
    micDenied: 'Microphone access denied. Please allow microphone access in browser settings.',
    sttError: 'Speech recognition error: ',

    // Pages
    home: 'Home',
    about: 'About',
    howToUse: 'How to Use & FAQ',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',

    // About page
    aboutTitle: 'About MedVoice Collector',
    aboutContent: `MedVoice Collector is an AI-powered medical voice data collection tool developed by SPINAI.

It recognizes doctor-patient conversations in real-time, automatically converts colloquial expressions into standardized medical terminology, and populates an Excel-style database — all hands-free.

**Who is it for?**
- Residents and attending physicians during rounds or outpatient clinics
- Medical professionals who want to streamline clinical documentation
- Physician Assistants (PAs), nurses, and medical students

**What problem does it solve?**
During consultations, doctors must simultaneously listen to patients, mentally translate colloquial expressions (e.g., "my upper right belly hurts") into medical terms (RUQ pain), and manually record everything. MedVoice Collector automates this entire workflow so physicians can focus entirely on the patient.

**Core Technology**
- Real-time speech recognition via Web Speech API (no audio files stored — patient privacy protected)
- Context-aware medical term conversion powered by Anthropic Claude AI
- Automatic fallback to OpenAI Whisper API on iOS Safari
- PWA support for native app-like experience on any device`,

    // How to use page
    howToUseTitle: 'How to Use & Frequently Asked Questions',
    step1Title: 'Step 1: Set Up Your API Key',
    step1Content: 'Click the settings (gear) icon in the top right corner and enter your Claude API key. iOS users should also enter their OpenAI API key for Whisper speech recognition.',
    step2Title: 'Step 2: Start Voice Recognition',
    step2Content: 'Tap the blue microphone button to begin real-time speech recognition. Have a natural conversation with your patient — the AI listens and transcribes automatically.',
    step3Title: 'Step 3: AI Conversion & Export',
    step3Content: 'Press the red stop button when finished. The AI will automatically convert the conversation into medical terminology. Review the results, then export to Excel, CSV, or clipboard for your EMR.',

    faqTitle: 'Frequently Asked Questions (FAQ)',
    faq: [
      { q: 'Is MedVoice Collector free to use?', a: 'Yes, MedVoice Collector is completely free during the current MVP phase. You provide your own Claude API key, so there are no costs from our side. You only pay for your own API usage directly to Anthropic.' },
      { q: 'Where is patient voice data stored?', a: 'Audio is never stored anywhere. The Web Speech API processes speech entirely within your browser. Only the text transcription is saved in your browser\'s local storage (localStorage). No data is ever sent to our servers.' },
      { q: 'Does it work on iOS Safari?', a: 'Yes! Since iOS Safari doesn\'t support the Web Speech API, MedVoice Collector automatically switches to OpenAI\'s Whisper API. Just enter your OpenAI API key in the settings.' },
      { q: 'Which medical specialties does it support?', a: 'Currently optimized for General Surgery and Internal Medicine, but it works well across most specialties. Custom specialty-specific medical dictionaries are planned for future updates.' },
      { q: 'Are my API keys safe?', a: 'Your API keys are stored exclusively in your browser\'s localStorage and are never transmitted to any external server. They persist even after closing the browser but cannot be accessed from other devices.' },
      { q: 'Can I use this during actual patient consultations?', a: 'MedVoice Collector is designed for real clinical workflows. However, please ensure you comply with your institution\'s policies regarding recording and AI tools during patient encounters. The tool does not store any audio recordings.' },
      { q: 'What languages are supported?', a: 'Currently, speech recognition is optimized for Korean medical conversations. The AI can convert Korean colloquial expressions into standardized English medical terminology. Multi-language support is planned for future releases.' },
    ],

    // Privacy
    privacyTitle: 'Privacy Policy',
    // Terms
    termsTitle: 'Terms of Service',
  },

  ja: {
    // Header
    newPatient: '+ 新患者',
    export: 'エクスポート',
    settings: '設定',

    // Settings
    claudeApiKey: 'Claude APIキー（医学用語変換）',
    whisperApiKey: 'OpenAI APIキー（iOS音声認識）',
    apiKeyNote: 'APIキーはブラウザにのみ保存され、外部に送信されません。',

    // Transcript
    realTimeConversation: 'リアルタイム会話',
    transcriptPlaceholder: '音声認識を開始すると、会話内容がここに表示されます...',
    startRecording: '音声認識を開始',
    pause: '一時停止',
    resume: '再開',
    stopAndConvert: '停止 & AI変換',
    converting: 'AIが医学用語に変換中...',
    iosMode: 'iOSモード：Whisper API使用中',

    // Table
    patientDataTable: '患者データテーブル',
    deletePatient: '患者を削除',

    // Patient tabs
    patientList: '患者一覧：',
    addPatient: '新しい患者を追加',

    // Footer
    builtBy: 'Built by',
    visitors: 'visitors',

    // Export
    excelExport: '.xlsx (Excel)',
    csvExport: '.csv',
    clipboardCopy: 'クリップボードにコピー',

    // Feedback
    sendFeedback: 'フィードバックを送信',
    feedbackTitle: 'フィードバックを送信',
    feedbackPlaceholder: 'ご意見や改善点をお聞かせください...',
    cancel: 'キャンセル',
    send: '送信',

    // Toast messages
    conversionComplete: 'AI変換完了！',
    conversionFailed: 'AI変換失敗：',
    setApiKey: 'Claude APIキーを設定してください',
    minOnePatient: '最低1人の患者が必要です',
    xlsxDownloaded: 'XLSXダウンロード完了！',
    csvDownloaded: 'CSVダウンロード完了！',
    copiedToClipboard: 'クリップボードにコピーしました！',
    feedbackSent: 'ありがとうございます！フィードバックが送信されました。',
    micDenied: 'マイクのアクセスが拒否されました。ブラウザ設定でマイクを許可してください。',
    sttError: '音声認識エラー：',

    // Pages
    home: 'ホーム',
    about: '概要',
    howToUse: '使い方 & FAQ',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',

    aboutTitle: 'MedVoice Collectorについて',
    aboutContent: `MedVoice Collectorは、SPINAIが開発したAI搭載の医療音声データ収集ツールです。

医師と患者の会話をリアルタイムで認識し、AIが自動的に医学用語に変換して、Excel形式のデータベースに入力します。

**対象ユーザー**
- 回診または外来診療中の研修医・専門医
- 診療記録を効率的に作成したい医療従事者
- PA、看護師、医学生

**解決する課題**
診察中に患者の口語表現を医学用語に変換しながら記録する作業をAIが自動処理します。

**コア技術**
- Web Speech APIによるリアルタイム音声認識（音声ファイル保存なし）
- Anthropic Claude AIによる文脈認識型医学用語変換
- iOS SafariではOpenAI Whisper APIへ自動フォールバック
- PWA対応でネイティブアプリのように使用可能`,

    howToUseTitle: '使い方 & よくある質問',
    step1Title: 'ステップ1：APIキーの設定',
    step1Content: '右上の設定（歯車）アイコンをクリックし、Claude APIキーを入力します。iOSユーザーはOpenAI APIキーも入力してください。',
    step2Title: 'ステップ2：音声認識を開始',
    step2Content: '青いマイクボタンをタップすると、リアルタイム音声認識が開始されます。患者と自然に会話してください。',
    step3Title: 'ステップ3：AI変換とエクスポート',
    step3Content: '赤い停止ボタンを押すと、AIが会話内容を医学用語に自動変換します。結果を確認してからExcel、CSV、またはクリップボードにエクスポートしてください。',

    faqTitle: 'よくある質問 (FAQ)',
    faq: [
      { q: 'MedVoice Collectorは無料ですか？', a: 'はい、現在のMVP段階では完全に無料です。ユーザーが直接Claude APIキーを入力して使用するため、当社側のコストは発生しません。' },
      { q: '患者の音声データはどこに保存されますか？', a: '音声ファイルは一切保存されません。Web Speech APIはブラウザ内でのみ処理され、テキスト変換結果のみがブラウザのlocalStorageに保存されます。' },
      { q: 'iOS Safariでも使えますか？', a: 'はい！iOS SafariはWeb Speech APIをサポートしていないため、自動的にOpenAI Whisper APIに切り替わります。設定でOpenAI APIキーを入力してください。' },
      { q: 'どの診療科で使えますか？', a: '現在は外科・内科に最適化されていますが、ほとんどの診療科で使用可能です。今後、診療科別カスタム辞書機能が追加される予定です。' },
      { q: 'APIキーは安全ですか？', a: 'APIキーはブラウザのlocalStorageにのみ保存され、外部サーバーには一切送信されません。' },
    ],

    privacyTitle: 'プライバシーポリシー',
    termsTitle: '利用規約',
  },

  zh: {
    newPatient: '+ 新患者',
    export: '导出',
    settings: '设置',
    claudeApiKey: 'Claude API密钥（医学术语转换）',
    whisperApiKey: 'OpenAI API密钥（iOS语音识别）',
    apiKeyNote: 'API密钥仅保存在您的浏览器中，不会发送到外部。',
    realTimeConversation: '实时对话',
    transcriptPlaceholder: '开始语音识别后，对话内容将显示在这里...',
    startRecording: '开始语音识别',
    pause: '暂停',
    resume: '继续',
    stopAndConvert: '停止并AI转换',
    converting: 'AI正在转换为医学术语...',
    iosMode: 'iOS模式：使用Whisper API',
    patientDataTable: '患者数据表',
    deletePatient: '删除患者',
    patientList: '患者列表：',
    addPatient: '添加新患者',
    builtBy: 'Built by',
    visitors: 'visitors',
    excelExport: '.xlsx (Excel)',
    csvExport: '.csv',
    clipboardCopy: '复制到剪贴板',
    sendFeedback: '发送反馈',
    feedbackTitle: '发送反馈',
    feedbackPlaceholder: '请分享您的建议或改进意见...',
    cancel: '取消',
    send: '发送',
    conversionComplete: 'AI转换完成！',
    conversionFailed: 'AI转换失败：',
    setApiKey: '请设置Claude API密钥',
    minOnePatient: '至少需要一名患者',
    xlsxDownloaded: 'XLSX下载完成！',
    csvDownloaded: 'CSV下载完成！',
    copiedToClipboard: '已复制到剪贴板！',
    feedbackSent: '谢谢！您的反馈已发送。',
    micDenied: '麦克风访问被拒绝。请在浏览器设置中允许麦克风访问。',
    sttError: '语音识别错误：',
    home: '首页',
    about: '关于',
    howToUse: '使用方法 & FAQ',
    privacy: '隐私政策',
    terms: '服务条款',
    aboutTitle: '关于 MedVoice Collector',
    aboutContent: `MedVoice Collector是由SPINAI开发的AI医疗语音数据收集工具。它能实时识别医患对话，自动将口语表达转换为标准医学术语，并填入Excel式数据库。

**目标用户**
- 查房或门诊中的住院医师/主治医师
- 希望提高临床记录效率的医疗人员
- PA、护士、医学生

**核心技术**
- Web Speech API实时语音识别（不保存音频文件）
- Anthropic Claude AI上下文感知医学术语转换
- iOS Safari自动切换至OpenAI Whisper API
- PWA支持，如原生应用般使用`,
    howToUseTitle: '使用方法和常见问题',
    step1Title: '第1步：设置API密钥',
    step1Content: '点击右上角的设置（齿轮）图标，输入您的Claude API密钥。iOS用户还需输入OpenAI API密钥。',
    step2Title: '第2步：开始语音识别',
    step2Content: '点击蓝色麦克风按钮开始实时语音识别。与患者自然对话即可。',
    step3Title: '第3步：AI转换和导出',
    step3Content: '按下红色停止按钮，AI将自动将对话转换为医学术语。审核结果后导出至Excel、CSV或剪贴板。',
    faqTitle: '常见问题 (FAQ)',
    faq: [
      { q: 'MedVoice Collector免费吗？', a: '是的，目前MVP阶段完全免费。用户自行输入Claude API密钥使用。' },
      { q: '患者语音数据存储在哪里？', a: '音频文件不会被存储。Web Speech API在浏览器内处理，只有文本保存在浏览器localStorage中。' },
      { q: '在iOS Safari上能用吗？', a: '可以！iOS Safari不支持Web Speech API，会自动切换到OpenAI Whisper API。' },
      { q: '支持哪些科室？', a: '目前针对外科和内科优化，但大多数科室都可使用。' },
      { q: 'API密钥安全吗？', a: 'API密钥仅存储在浏览器localStorage中，不会传输到任何外部服务器。' },
    ],
    privacyTitle: '隐私政策',
    termsTitle: '服务条款',
  },
}

function detectLanguage() {
  const stored = localStorage.getItem('medvoice_lang')
  if (stored && translations[stored]) return stored

  const browserLang = navigator.language || navigator.userLanguage || 'en'
  const lang = browserLang.split('-')[0].toLowerCase()

  if (translations[lang]) return lang
  return 'en'
}

export function getLang() {
  return detectLanguage()
}

export function setLang(lang) {
  localStorage.setItem('medvoice_lang', lang)
}

export function t(key, lang) {
  const l = lang || detectLanguage()
  return translations[l]?.[key] || translations.en?.[key] || key
}

export function getSupportedLangs() {
  return [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
  ]
}

export default translations
