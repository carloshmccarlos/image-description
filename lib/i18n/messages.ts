export const SUPPORTED_LOCALES = ['en','zh','ja','ko'] as const
export type Locale = typeof SUPPORTED_LOCALES[number]

export type Messages = {
  nav: {
    appName: string
    analyze: string
    history: string
    signIn: string
    language: string
  }
  common: {
    newSession: string
    backToUpload: string
    saveSession: string
    saving: string
    saved: string
  }
  analyzePage: {
    title: string
    subtitle: string
    steps: {
      uploadTitle: string
      uploadDesc: string
      analyzeTitle: string
      analyzeDesc: string
    }
  }
  landing: {
    heroBadge: string
    heroTitle: string
    heroHighlight: string
    heroDescription: string
    primaryCta: string
    secondaryCta: string
    features: Array<{
      icon: string
      title: string
      description: string
    }>
  }
  upload: {
    dropTitle: string
    dropSubtitle: string
    browseCta: string
    compressingTitle: string
    compressingSubtitle: string
    uploadingTitle: string
    uploadingSubtitle: string
    analyzingTitle: string
    analyzingSubtitle: string
    languageHeading: string
    targetLabel: string
    targetHint: string
    nativeLabel: string
    nativeHint: string
    difficultyHeading: string
    runAnalysisCta: string
    errorMessage: string
  }
  results: {
    backLabel: string
    saveCta: string
    saving: string
    saved: string
    descriptionLabel: string
    nativeToggleLabel: string
    translationHint: string
    vocabularyHeading: string
    saveError: string
  }
  history: {
    title: string
    subtitle: string
    emptyMessage: string
    emptyCta: string
    deleteConfirm: string
    deleteError: string
  }
  languages: Record<string,string>
}

const dictionaries: Record<Locale, Messages> = {
  en: {
    nav: {
      appName: 'LexiLens',
      analyze: 'Analyze',
      history: 'History',
      signIn: 'Sign In',
      language: 'Language'
    },
    common: {
      newSession: 'New Session',
      backToUpload: 'Back to Upload',
      saveSession: 'Save Session',
      saving: 'Saving...',
      saved: 'Saved to History'
    },
    analyzePage: {
      title: 'New Learning Session',
      subtitle: 'Upload an image to start extracting vocabulary and descriptions.',
      steps: {
        uploadTitle: 'Upload',
        uploadDesc: 'Choose any high-quality photo with clear objects.',
        analyzeTitle: 'Analyze',
        analyzeDesc: 'Our AI identifies vocabulary and natural language insights.'
      }
    },
    landing: {
      heroBadge: 'AI-Powered Visual Learning',
      heroTitle: 'Master Any Language',
      heroHighlight: 'Visual Context',
      heroDescription: 'LexiLens uses advanced AI to transform any image into a personalized language lesson. Upload a photo, explore vocabulary, and master descriptions in your target language.',
      primaryCta: 'Get Started Free',
      secondaryCta: 'How it Works',
      features: [
        { icon: '📸', title: 'Visual Context', description: 'Learn words as they appear in the real world, making them easier to remember.' },
        { icon: '🤖', title: 'AI Descriptions', description: 'Get natural-sounding descriptions at various difficulty levels (A1 to C1).' },
        { icon: '🌍', title: 'Dynamic Translation', description: 'Learn in your native language with instant bridges to your target language.' }
      ]
    },
    upload: {
      dropTitle: 'Select a Scene',
      dropSubtitle: 'Drag & drop a photo here, or click to browse',
      browseCta: 'Browse Files',
      compressingTitle: 'Optimizing Image...',
      compressingSubtitle: 'Reducing file size for faster AI analysis',
      uploadingTitle: 'Uploading...',
      uploadingSubtitle: 'Uploading to secure storage',
      analyzingTitle: 'Analyzing Scene...',
      analyzingSubtitle: 'AI is processing your image',
      languageHeading: 'Language Pairing',
      targetLabel: 'Target Language',
      targetHint: 'What you want to learn',
      nativeLabel: 'Your Mother Language',
      nativeHint: 'Translations shown in this language',
      difficultyHeading: 'Study Level',
      runAnalysisCta: 'Run AI Analysis',
      errorMessage: 'Analysis failed. Please try again.'
    },
    results: {
      backLabel: 'Back to Upload',
      saveCta: 'Save Session',
      saving: 'Saving...',
      saved: 'Saved to History',
      descriptionLabel: 'Perspective',
      nativeToggleLabel: 'Native',
      translationHint: 'We translated this scene into {language} to help bridge concepts and words.',
      vocabularyHeading: 'Key Vocabulary',
      saveError: 'Could not save to history. Ensure database is configured.'
    },
    history: {
      title: 'Learning History',
      subtitle: 'Review your previous visual lessons and vocabulary.',
      emptyMessage: "You haven't saved any lessons yet.",
      emptyCta: 'Analyze Your First Image',
      deleteConfirm: 'Are you sure you want to delete this lesson?',
      deleteError: 'Failed to delete lesson.'
    },
    languages: {
      en: 'English',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean'
    }
  },
  zh: {
    nav: {
      appName: 'LexiLens',
      analyze: '开始分析',
      history: '学习记录',
      signIn: '登录',
      language: '语言'
    },
    common: {
      newSession: '新的学习',
      backToUpload: '返回上传',
      saveSession: '保存本次学习',
      saving: '保存中…',
      saved: '已保存到历史'
    },
    analyzePage: {
      title: '新的学习会话',
      subtitle: '上传图片即可提取词汇和场景描述。',
      steps: {
        uploadTitle: '上传',
        uploadDesc: '选择一张物体清晰的高质量照片。',
        analyzeTitle: '分析',
        analyzeDesc: 'AI 会识别词汇并生成自然表达。'
      }
    },
    landing: {
      heroBadge: 'AI 视觉语言学习',
      heroTitle: '掌握任何语言',
      heroHighlight: '视觉语境',
      heroDescription: 'LexiLens 利用先进 AI 将图片转化为个性化语言课程。上传照片即可探索词汇并掌握描述。',
      primaryCta: '免费开始体验',
      secondaryCta: '了解流程',
      features: [
        { icon: '📸', title: '视觉语境', description: '在真实场景中学习词汇，更容易记住。' },
        { icon: '🤖', title: 'AI 描述', description: '根据不同难度生成自然描述（A1 至 C1）。' },
        { icon: '🌍', title: '即时翻译', description: '在母语与目标语言之间即时切换。' }
      ]
    },
    upload: {
      dropTitle: '选择一张场景图',
      dropSubtitle: '拖拽或点击上传照片',
      browseCta: '浏览文件',
      compressingTitle: '正在优化图片…',
      compressingSubtitle: '压缩体积以更快完成分析',
      uploadingTitle: '正在上传…',
      uploadingSubtitle: '正在上传到安全存储',
      analyzingTitle: '正在分析场景…',
      analyzingSubtitle: 'AI 正在处理您的图片',
      languageHeading: '语言配置',
      targetLabel: '目标语言',
      targetHint: '你想学习的语言',
      nativeLabel: '母语',
      nativeHint: '翻译将使用此语言显示',
      difficultyHeading: '学习等级',
      runAnalysisCta: '运行 AI 分析',
      errorMessage: '分析失败，请重试。'
    },
    results: {
      backLabel: '返回上传',
      saveCta: '保存本次学习',
      saving: '保存中…',
      saved: '已保存到历史',
      descriptionLabel: '场景描述',
      nativeToggleLabel: '母语',
      translationHint: '我们已翻译成 {language}，帮助你在概念与词汇之间建立连接。',
      vocabularyHeading: '重点词汇',
      saveError: '无法保存到历史，请检查数据库配置。'
    },
    history: {
      title: '学习记录',
      subtitle: '回顾之前的视觉课程与词汇。',
      emptyMessage: '你还没有保存任何课程。',
      emptyCta: '开始分析第一张图片',
      deleteConfirm: '确定要删除这个课程吗？',
      deleteError: '删除失败。'
    },
    languages: {
      en: '英语',
      zh: '中文',
      ja: '日语',
      ko: '韩语'
    }
  },
  ja: {
    nav: {
      appName: 'LexiLens',
      analyze: '解析',
      history: '履歴',
      signIn: 'ログイン',
      language: '言語'
    },
    common: {
      newSession: '新しいセッション',
      backToUpload: 'アップロードに戻る',
      saveSession: 'セッションを保存',
      saving: '保存中…',
      saved: '履歴に保存しました'
    },
    analyzePage: {
      title: '新しい学習セッション',
      subtitle: '画像をアップロードして語彙と説明を生成しましょう。',
      steps: {
        uploadTitle: 'アップロード',
        uploadDesc: 'オブジェクトがはっきり写った写真を選んでください。',
        analyzeTitle: '解析',
        analyzeDesc: 'AI が語彙と自然な表現を抽出します。'
      }
    },
    landing: {
      heroBadge: 'AIビジュアル学習',
      heroTitle: 'どんな言語でも習得',
      heroHighlight: '視覚的コンテキスト',
      heroDescription: 'LexiLensは画像をパーソナライズされた語学レッスンに変換します。写真をアップロードして語彙と説明を学びましょう。',
      primaryCta: '無料で始める',
      secondaryCta: '仕組みを見る',
      features: [
        { icon: '📸', title: '視覚文脈', description: '実際のシーンで単語を学び、記憶に定着させます。' },
        { icon: '🤖', title: 'AI記述', description: 'A1〜C1の難易度で自然な文章を生成します。' },
        { icon: '🌍', title: 'ダイナミック翻訳', description: '母語と学習言語をシームレスに行き来できます。' }
      ]
    },
    upload: {
      dropTitle: 'シーンを選択',
      dropSubtitle: '画像をドラッグ＆ドロップ、またはクリックして選択',
      browseCta: 'ファイルを選択',
      compressingTitle: '画像を最適化中…',
      compressingSubtitle: '高速解析のために圧縮しています',
      uploadingTitle: 'アップロード中…',
      uploadingSubtitle: '安全なストレージへアップロード中',
      analyzingTitle: 'シーンを解析中…',
      analyzingSubtitle: 'AIが画像を処理しています',
      languageHeading: '言語設定',
      targetLabel: '学習言語',
      targetHint: '学びたい言語',
      nativeLabel: '母語',
      nativeHint: '翻訳を表示する言語',
      difficultyHeading: '学習レベル',
      runAnalysisCta: 'AI 解析を実行',
      errorMessage: '解析に失敗しました。もう一度お試しください。'
    },
    results: {
      backLabel: 'アップロードに戻る',
      saveCta: 'セッションを保存',
      saving: '保存中…',
      saved: '履歴に保存しました',
      descriptionLabel: '描写',
      nativeToggleLabel: '母語',
      translationHint: '{language} に翻訳して概念と語彙の橋渡しをします。',
      vocabularyHeading: 'キーワード',
      saveError: '履歴への保存に失敗しました。設定を確認してください。'
    },
    history: {
      title: '学習履歴',
      subtitle: 'これまでのレッスンと語彙を確認しましょう。',
      emptyMessage: 'まだレッスンが保存されていません。',
      emptyCta: '最初の画像を解析する',
      deleteConfirm: 'このレッスンを削除しますか？',
      deleteError: '削除に失敗しました。'
    },
    languages: {
      en: '英語',
      zh: '中国語',
      ja: '日本語',
      ko: '韓国語'
    }
  },
  ko: {
    nav: {
      appName: 'LexiLens',
      analyze: '분석',
      history: '학습 기록',
      signIn: '로그인',
      language: '언어'
    },
    common: {
      newSession: '새 세션',
      backToUpload: '업로드로 돌아가기',
      saveSession: '세션 저장',
      saving: '저장 중…',
      saved: '기록에 저장됨'
    },
    analyzePage: {
      title: '새 학습 세션',
      subtitle: '이미지를 업로드해 어휘와 설명을 생성하세요.',
      steps: {
        uploadTitle: '업로드',
        uploadDesc: '물체가 선명한 고화질 사진을 선택하세요.',
        analyzeTitle: '분석',
        analyzeDesc: 'AI가 어휘와 자연스러운 설명을 제공합니다.'
      }
    },
    landing: {
      heroBadge: 'AI 비주얼 학습',
      heroTitle: '어떤 언어든 마스터',
      heroHighlight: '시각적 컨텍스트',
      heroDescription: 'LexiLens는 이미지를 맞춤형 언어 수업으로 변환합니다. 사진을 업로드하고 어휘와 묘사를 즉시 배워보세요.',
      primaryCta: '무료로 시작하기',
      secondaryCta: '작동 방식',
      features: [
        { icon: '📸', title: '시각 맥락', description: '현실 속 장면에서 단어를 익혀 기억력을 높입니다.' },
        { icon: '🤖', title: 'AI 설명', description: 'A1~C1 난이도에 맞는 자연스러운 문장을 제공합니다.' },
        { icon: '🌍', title: '동적 번역', description: '모국어와 목표 언어를 즉시 연결합니다.' }
      ]
    },
    upload: {
      dropTitle: '장면 선택',
      dropSubtitle: '사진을 드래그하거나 클릭하여 업로드',
      browseCta: '파일 찾아보기',
      compressingTitle: '이미지 최적화 중…',
      compressingSubtitle: '더 빠른 분석을 위해 용량을 줄이는 중입니다',
      uploadingTitle: '업로드 중…',
      uploadingSubtitle: '보안 저장소로 업로드하는 중입니다',
      analyzingTitle: '장면 분석 중…',
      analyzingSubtitle: 'AI가 이미지를 처리하고 있습니다',
      languageHeading: '언어 설정',
      targetLabel: '학습 언어',
      targetHint: '배우고 싶은 언어',
      nativeLabel: '모국어',
      nativeHint: '번역이 표시될 언어',
      difficultyHeading: '학습 난이도',
      runAnalysisCta: 'AI 분석 실행',
      errorMessage: '분석에 실패했습니다. 다시 시도해주세요.'
    },
    results: {
      backLabel: '업로드로 돌아가기',
      saveCta: '세션 저장',
      saving: '저장 중…',
      saved: '기록에 저장됨',
      descriptionLabel: '설명',
      nativeToggleLabel: '모국어',
      translationHint: '개념과 단어를 연결할 수 있도록 {language}(으)로 번역했습니다.',
      vocabularyHeading: '핵심 어휘',
      saveError: '기록 저장에 실패했습니다. 데이터베이스 구성을 확인해주세요.'
    },
    history: {
      title: '학습 기록',
      subtitle: '지난 레슨과 어휘를 살펴보세요.',
      emptyMessage: '아직 저장된 레슨이 없습니다.',
      emptyCta: '첫 이미지를 분석하기',
      deleteConfirm: '이 레슨을 삭제할까요?',
      deleteError: '삭제에 실패했습니다.'
    },
    languages: {
      en: '영어',
      zh: '중국어',
      ja: '일본어',
      ko: '한국어'
    }
  }
}

export const DEFAULT_LOCALE: Locale = 'en'

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE]
}
