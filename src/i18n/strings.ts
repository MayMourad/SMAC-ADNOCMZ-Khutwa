/**
 * UI strings — English + Arabic
 * ============================
 *
 * Every user-facing string in the app lives here. Screens read them through
 * `useT()` (src/i18n/index.tsx). `{name}` placeholders are filled by `t()`.
 *
 * Arabic is Modern Standard, kept warm and plain. Location narrations are NOT
 * here — they're in src/data/stories.ts, keyed by language.
 */

export type Lang = 'en' | 'ar';

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

type Dict = Record<string, string>;

const en: Dict = {
  // common
  'app.name': 'Khutwa',
  'app.tagline': 'Every step waters the story',
  'common.loading': 'Loading…',
  'common.retry': 'Try again',
  'common.signOut': 'Sign out',
  'common.somethingWrong': 'Something went wrong',
  'common.errorBody':
    'The app hit an unexpected error. You can try again — if it keeps happening, restart the app.',

  // landing
  'landing.get_started': 'Get started',
  'landing.have_code': 'I have an invite code',
  'landing.value1.title': 'Walk together',
  'landing.value1.body': 'Your family’s steps grow one shared Ghaf tree.',
  'landing.value2.title': 'Unlock the stories',
  'landing.value2.body': 'Near a family place, a short heritage story is read aloud.',
  'landing.value3.title': 'Bloom when you’re together',
  'landing.value3.body': 'Stand in the same place and the tree lights up.',

  // auth
  'auth.signIn': 'Sign in',
  'auth.createAccount': 'Create account',
  'auth.back': 'Back',
  'auth.name': 'Your name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.continueAnon': 'Continue without an account',
  'auth.starting': 'Starting Khutwa…',

  // family setup
  'setup.title': 'Your family',
  'setup.subtitle': 'Start a family tree, or join one you were invited to.',
  'setup.startNew': 'Start a new family',
  'setup.createFamily': 'Create family',
  'setup.joinWithCode': 'Join with an invite code',
  'setup.joinFamily': 'Join family',
  'setup.codePlaceholder': 'GHAF-XXXX',
  'setup.finding': 'Finding your family…',

  // nav
  'nav.home': 'Tree',

  // home
  'home.loadingTree': 'Loading your family tree…',
  'home.khutwaScore': 'Khutwa Score',
  'home.dim.root': 'Root',
  'home.dim.root.sub': 'health',
  'home.dim.bloom': 'Bloom',
  'home.dim.bloom.sub': 'bonding',
  'home.dim.heritage': 'Heritage',
  'home.dim.heritage.sub': 'culture',
  'home.memories': 'Memories unlocked',
  'home.memories.of': 'of {total}',
  'home.memories.hint': 'Walk near a family place to unlock its story.',

  // tree captions (by growth stage)
  'tree.seed': 'A seed, waiting for the first walk.',
  'tree.sprout': 'A sprout — your first steps together.',
  'tree.sapling': 'A sapling finding its roots.',
  'tree.young': 'A young Ghaf, steady and growing.',
  'tree.mature': 'A strong tree, full of shared memories.',
  'tree.ancient': 'An ancient Ghaf — a family landmark.',
  'tree.blooming': 'Your family is here together — the tree is blooming.',

  // walk
  'walk.title': 'Walk',
  'walk.stepsThisWalk': 'Steps this walk',
  'walk.start': 'Start walk',
  'walk.end': 'End walk',
  'walk.ready': 'Ready.',
  'walk.together': 'Together',
  'walk.togetherHint':
    "When you're walking as a family, check in together to make the tree bloom.",
  'walk.weAreTogether': "We're together",
  'walk.weAreDone': "We're done",
  'walk.logManual': 'Log steps manually',
  'walk.logManualHint':
    "For testing where the pedometer can't read history (e.g. Android).",
  'walk.log': 'Log',
  'walk.stepsPlaceholder': 'e.g. 2500',
  'walk.status.askingPermission': 'Asking for location permission…',
  'walk.status.permissionDenied': 'Location permission denied — geofencing is off.',
  'walk.status.startedBg': 'Walk started. Geofencing active in the background.',
  'walk.status.startedFg': 'Walk started. Geofencing active while the app is open.',
  'walk.status.ended': 'Walk ended.',
  'walk.status.reached': "You've reached {place}.",
  'walk.status.storyFinished': 'Story finished.',
  'walk.status.blooming': 'The tree is blooming.',
  'walk.status.bloomCleared': 'Bloom cleared.',
  'walk.status.logged': 'Logged {n} steps for {name}.',

  // stories
  'stories.title': 'Stories',
  'stories.progress': '{n} of {total} family places unlocked',
  'stories.locked': 'Locked',
  'stories.unlocked': 'Unlocked',
  'stories.play': 'Play story',
  'stories.stop': 'Stop',
  'stories.lockedHint': 'Walk near {place} together to unlock this story.',

  // family
  'family.title': 'Family',
  'family.inviteCode': 'Invite code',
  'family.inviteHint': 'Share this with a family member so they can join your group.',
  'family.members': 'Members',
  'family.you': 'you',
  'family.role.guardian': 'guardian',
  'family.role.member': 'member',
  'family.location.shared': 'location shared',
  'family.location.private': 'location private',
  'family.privacy': 'Your privacy',
  'family.privacyBody':
    'Location is processed on your device. It is used only to unlock nearby family stories and to bloom the tree when you are together. It is not shared outside your family group and not sent to any third party. AI stories are written ahead of time from approved content — your live location is never sent to an AI service.',
  'family.language': 'Language',
};

const ar: Dict = {
  'app.name': 'خُطوة',
  'app.tagline': 'كل خطوة تسقي الحكاية',
  'common.loading': 'جارٍ التحميل…',
  'common.retry': 'إعادة المحاولة',
  'common.signOut': 'تسجيل الخروج',
  'common.somethingWrong': 'حدث خطأ ما',
  'common.errorBody':
    'واجه التطبيق خطأً غير متوقع. يمكنك المحاولة مجددًا — وإذا استمر، أعد تشغيل التطبيق.',

  'landing.get_started': 'لنبدأ',
  'landing.have_code': 'لديّ رمز دعوة',
  'landing.value1.title': 'امشوا معًا',
  'landing.value1.body': 'خطوات عائلتك تُنمّي شجرة غاف واحدة تجمعكم.',
  'landing.value2.title': 'افتحوا الحكايات',
  'landing.value2.body': 'قرب مكان عزيز على العائلة، تُروى حكاية تراثية قصيرة.',
  'landing.value3.title': 'تُزهر حين تجتمعون',
  'landing.value3.body': 'قِفوا في المكان نفسه فتُضيء الشجرة.',

  'auth.signIn': 'تسجيل الدخول',
  'auth.createAccount': 'إنشاء حساب',
  'auth.back': 'رجوع',
  'auth.name': 'اسمك',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.continueAnon': 'المتابعة بدون حساب',
  'auth.starting': 'جارٍ بدء خُطوة…',

  'setup.title': 'عائلتك',
  'setup.subtitle': 'ابدأ شجرة العائلة، أو انضم إلى شجرة دُعيت إليها.',
  'setup.startNew': 'ابدأ عائلة جديدة',
  'setup.createFamily': 'إنشاء العائلة',
  'setup.joinWithCode': 'انضم برمز الدعوة',
  'setup.joinFamily': 'انضمام',
  'setup.codePlaceholder': 'GHAF-XXXX',
  'setup.finding': 'جارٍ البحث عن عائلتك…',

  'nav.home': 'الشجرة',

  'home.loadingTree': 'جارٍ تحميل شجرة العائلة…',
  'home.khutwaScore': 'نقاط خُطوة',
  'home.dim.root': 'الجذور',
  'home.dim.root.sub': 'الصحّة',
  'home.dim.bloom': 'الإزهار',
  'home.dim.bloom.sub': 'التقارب',
  'home.dim.heritage': 'التراث',
  'home.dim.heritage.sub': 'الثقافة',
  'home.memories': 'الذكريات المفتوحة',
  'home.memories.of': 'من {total}',
  'home.memories.hint': 'امشِ قرب مكان عزيز على العائلة لتفتح حكايته.',

  'tree.seed': 'بذرة تنتظر أول خطوة.',
  'tree.sprout': 'برعم — خطواتكم الأولى معًا.',
  'tree.sapling': 'شتلة تمدّ جذورها.',
  'tree.young': 'غافة فتيّة، ثابتة وتنمو.',
  'tree.mature': 'شجرة قويّة مليئة بالذكريات المشتركة.',
  'tree.ancient': 'غافة عتيقة — معلَمٌ للعائلة.',
  'tree.blooming': 'عائلتك مجتمعة هنا — الشجرة تُزهر.',

  'walk.title': 'المشي',
  'walk.stepsThisWalk': 'خطوات هذه الجولة',
  'walk.start': 'ابدأ المشي',
  'walk.end': 'إنهاء المشي',
  'walk.ready': 'جاهز.',
  'walk.together': 'معًا',
  'walk.togetherHint': 'حين تمشون كعائلة، سجّلوا حضوركم معًا لتُزهر الشجرة.',
  'walk.weAreTogether': 'نحن معًا',
  'walk.weAreDone': 'انتهينا',
  'walk.logManual': 'تسجيل الخطوات يدويًا',
  'walk.logManualHint': 'للاختبار حين يتعذّر قراءة سجلّ الخطوات (مثل أندرويد).',
  'walk.log': 'تسجيل',
  'walk.stepsPlaceholder': 'مثال: 2500',
  'walk.status.askingPermission': 'جارٍ طلب إذن الموقع…',
  'walk.status.permissionDenied': 'رُفض إذن الموقع — تتبّع المواقع متوقّف.',
  'walk.status.startedBg': 'بدأ المشي. تتبّع المواقع يعمل في الخلفية.',
  'walk.status.startedFg': 'بدأ المشي. تتبّع المواقع يعمل أثناء فتح التطبيق.',
  'walk.status.ended': 'انتهى المشي.',
  'walk.status.reached': 'وصلت إلى {place}.',
  'walk.status.storyFinished': 'انتهت الحكاية.',
  'walk.status.blooming': 'الشجرة تُزهر.',
  'walk.status.bloomCleared': 'انتهى الإزهار.',
  'walk.status.logged': 'سُجّلت {n} خطوة لـ {name}.',

  'stories.title': 'الحكايات',
  'stories.progress': 'فُتح {n} من {total} من أماكن العائلة',
  'stories.locked': 'مقفل',
  'stories.unlocked': 'مفتوح',
  'stories.play': 'تشغيل الحكاية',
  'stories.stop': 'إيقاف',
  'stories.lockedHint': 'امشِ قرب {place} مع العائلة لتفتح هذه الحكاية.',

  'family.title': 'العائلة',
  'family.inviteCode': 'رمز الدعوة',
  'family.inviteHint': 'شارك هذا الرمز مع أحد أفراد العائلة لينضمّ إلى مجموعتك.',
  'family.members': 'الأفراد',
  'family.you': 'أنت',
  'family.role.guardian': 'وليّ الأمر',
  'family.role.member': 'فرد',
  'family.location.shared': 'الموقع مُشارَك',
  'family.location.private': 'الموقع خاص',
  'family.privacy': 'خصوصيتك',
  'family.privacyBody':
    'تتم معالجة الموقع على جهازك فقط. يُستخدم لفتح حكايات الأماكن القريبة ولإزهار الشجرة حين تكونون معًا. لا يُشارَك خارج مجموعة العائلة ولا يُرسَل إلى أي طرف ثالث. حكايات الذكاء الاصطناعي مكتوبة مسبقًا من محتوى معتمد — ولا يُرسَل موقعك المباشر إلى أي خدمة ذكاء اصطناعي أبدًا.',
  'family.language': 'اللغة',
};

export const STRINGS: Record<Lang, Dict> = { en, ar };
