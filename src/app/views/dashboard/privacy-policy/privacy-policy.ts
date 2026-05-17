import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrivacyPolicyService } from '../../../core/services/privacy-policy.service';
import { PrivacyPolicy } from '../../../core/models/privacy-policy.model';

type LangTab = 'en' | 'ar';
type ViewMode = 'edit' | 'preview';

// ─────────────────────────────────────────────────────────────
// Default content (used when the backend returns empty strings)
// ─────────────────────────────────────────────────────────────
const DEFAULT_EN = `<h1>Privacy Policy</h1>
<p><strong>Last Updated:</strong> January 1, 2025</p>

<h2>1. Introduction</h2>
<p>Jeeran Real Estate (&ldquo;Jeeran&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website (<a href="https://jeeran-realestate.com">jeeran-realestate.com</a>), our mobile application, or any of our services (collectively, the &ldquo;Services&rdquo;).</p>
<p>By accessing or using our Services, you agree to the collection and use of information in accordance with this policy.</p>

<h2>2. Information We Collect</h2>
<h3>a. Information You Provide Directly</h3>
<ul>
  <li>Full name, email address, phone number, and WhatsApp number when you register an account or contact an agent</li>
  <li>Property preferences, search criteria, and saved listings</li>
  <li>Messages and communications sent through our platform</li>
</ul>
<h3>b. Information Collected Automatically</h3>
<ul>
  <li>Device information (device type, operating system, unique device identifiers)</li>
  <li>Log data (IP address, browser type, pages visited, time and date of access)</li>
  <li>Location data (approximate location based on IP; precise location if you grant permission)</li>
  <li>Push notification tokens for delivering in-app and mobile notifications</li>
</ul>
<h3>c. Information from Third Parties</h3>
<ul>
  <li>Social media profile information if you connect your social accounts</li>
  <li>Analytics data from third-party service providers</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li>Provide, operate, and maintain our real estate platform</li>
  <li>Match buyers with suitable properties and connect them with agents</li>
  <li>Send you property alerts, notifications, and updates you have subscribed to</li>
  <li>Process transactions and manage your account</li>
  <li>Communicate with you about inquiries, appointments, and service updates</li>
  <li>Analyze usage patterns to improve our platform and user experience</li>
  <li>Comply with legal obligations and prevent fraud</li>
</ul>

<h2>4. Information Sharing</h2>
<p>We do not sell or rent your personal information to third parties. We may share your information with:</p>
<ul>
  <li><strong>Real estate agents and developers</strong> listed on our platform, solely to facilitate your property inquiries</li>
  <li><strong>Service providers</strong> who assist us in operating our platform (hosting, analytics, payment processing)</li>
  <li><strong>Legal authorities</strong> when required by law or to protect our rights and the safety of our users</li>
  <li><strong>Business partners</strong> in connection with a merger, acquisition, or sale of assets, with your data protected under equivalent terms</li>
</ul>

<h2>5. Data Security</h2>
<p>We implement industry-standard security measures to protect your information, including:</p>
<ul>
  <li>SSL/TLS encryption for all data in transit</li>
  <li>Encrypted storage for sensitive personal data</li>
  <li>Regular security audits and vulnerability assessments</li>
  <li>Restricted access controls limiting data access to authorized personnel only</li>
</ul>
<p>Despite these measures, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and protect your account credentials.</p>

<h2>6. Cookies and Tracking Technologies</h2>
<p>We use cookies and similar tracking technologies to enhance your experience. These include:</p>
<ul>
  <li><strong>Essential cookies:</strong> Required for the platform to function properly</li>
  <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our Services</li>
  <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
</ul>
<p>You may disable cookies in your browser settings, but this may affect the functionality of our Services.</p>

<h2>7. Third-Party Links</h2>
<p>Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before providing any personal information.</p>

<h2>8. Your Rights</h2>
<p>Depending on your location, you may have the following rights regarding your personal data:</p>
<ul>
  <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
  <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
  <li><strong>Erasure:</strong> Request deletion of your personal data, subject to certain conditions</li>
  <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
  <li><strong>Objection:</strong> Object to the processing of your data for certain purposes</li>
</ul>
<p>To exercise your rights, please contact us at the address below.</p>

<h2>9. Children&rsquo;s Privacy</h2>
<p>Our Services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it promptly.</p>

<h2>10. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our platform and updating the &ldquo;Last Updated&rdquo; date. Your continued use of our Services after such changes constitutes your acceptance of the updated policy.</p>

<h2>11. Contact Us</h2>
<p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
<p>
  <strong>Jeeran Real Estate</strong><br>
  Cairo, Egypt<br>
  Phone: +20 100 546 4855<br>
  Email: <a href="mailto:info@jeeran-realestate.com">info@jeeran-realestate.com</a><br>
  Website: <a href="https://jeeran-realestate.com">www.jeeran-realestate.com</a>
</p>`;

const DEFAULT_AR = `<h1>سياسة الخصوصية</h1>
<p><strong>آخر تحديث:</strong> ١ يناير ٢٠٢٥</p>

<h2>١. مقدمة</h2>
<p>تلتزم شركة جيران للعقارات (&ldquo;جيران&rdquo; أو &ldquo;نحن&rdquo; أو &ldquo;لنا&rdquo;) بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك الشخصية واستخدامها والإفصاح عنها وحمايتها عند استخدامك موقعنا الإلكتروني (<a href="https://jeeran-realestate.com">jeeran-realestate.com</a>) أو تطبيقنا للجوال أو أي من خدماتنا (يُشار إليها مجتمعةً بـ&ldquo;الخدمات&rdquo;).</p>
<p>باستخدامك خدماتنا أو الوصول إليها، فإنك توافق على جمع المعلومات واستخدامها وفقاً لهذه السياسة.</p>

<h2>٢. المعلومات التي نجمعها</h2>
<h3>أ. المعلومات التي تقدمها مباشرةً</h3>
<ul>
  <li>الاسم الكامل وعنوان البريد الإلكتروني ورقم الهاتف ورقم واتساب عند تسجيل حساب أو التواصل مع وكيل عقاري</li>
  <li>تفضيلات العقارات ومعايير البحث والقوائم المحفوظة</li>
  <li>الرسائل والمراسلات المرسلة عبر منصتنا</li>
</ul>
<h3>ب. المعلومات التي يتم جمعها تلقائياً</h3>
<ul>
  <li>معلومات الجهاز (نوع الجهاز ونظام التشغيل والمعرّفات الفريدة للجهاز)</li>
  <li>بيانات السجل (عنوان IP ونوع المتصفح والصفحات التي تمت زيارتها ووقت الوصول وتاريخه)</li>
  <li>بيانات الموقع الجغرافي (الموقع التقريبي بناءً على عنوان IP أو الموقع الدقيق إذا منحت الإذن)</li>
  <li>رموز الإشعارات الفورية لإرسال الإشعارات داخل التطبيق وعلى الجوال</li>
</ul>
<h3>ج. المعلومات من أطراف ثالثة</h3>
<ul>
  <li>معلومات الملف الشخصي على وسائل التواصل الاجتماعي إذا ربطت حساباتك الاجتماعية</li>
  <li>بيانات التحليلات من مزودي الخدمات الخارجيين</li>
</ul>

<h2>٣. كيف نستخدم معلوماتك</h2>
<p>نستخدم المعلومات التي نجمعها من أجل:</p>
<ul>
  <li>توفير منصتنا العقارية وتشغيلها وصيانتها</li>
  <li>مطابقة المشترين مع العقارات المناسبة وربطهم بالوكلاء</li>
  <li>إرسال تنبيهات العقارات والإشعارات والتحديثات التي اشتركت فيها</li>
  <li>معالجة المعاملات وإدارة حسابك</li>
  <li>التواصل معك بشأن الاستفسارات والمواعيد وتحديثات الخدمة</li>
  <li>تحليل أنماط الاستخدام لتحسين منصتنا وتجربة المستخدم</li>
  <li>الامتثال للالتزامات القانونية ومنع الاحتيال</li>
</ul>

<h2>٤. مشاركة المعلومات</h2>
<p>لا نبيع معلوماتك الشخصية ولا نؤجرها لأطراف ثالثة. قد نشارك معلوماتك مع:</p>
<ul>
  <li><strong>وكلاء العقارات والمطورين</strong> المدرجين على منصتنا، وذلك حصرياً لتيسير استفساراتك العقارية</li>
  <li><strong>مزودي الخدمات</strong> الذين يساعدوننا في تشغيل منصتنا (الاستضافة والتحليلات ومعالجة المدفوعات)</li>
  <li><strong>الجهات القانونية</strong> عند الاقتضاء القانوني أو لحماية حقوقنا وسلامة مستخدمينا</li>
  <li><strong>شركاء الأعمال</strong> في حالات الاندماج أو الاستحواذ أو بيع الأصول، مع حماية بياناتك وفق شروط مكافئة</li>
</ul>

<h2>٥. أمن البيانات</h2>
<p>نطبق معايير أمنية بمستوى الصناعة لحماية معلوماتك، تشمل:</p>
<ul>
  <li>تشفير SSL/TLS لجميع البيانات أثناء النقل</li>
  <li>تخزين مشفر للبيانات الشخصية الحساسة</li>
  <li>عمليات تدقيق أمني دورية وتقييمات للثغرات</li>
  <li>ضوابط وصول مقيدة تحصر الوصول إلى البيانات للموظفين المخوّلين فقط</li>
</ul>
<p>على الرغم من هذه الإجراءات، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%. نحثك على استخدام كلمات مرور قوية وحماية بيانات اعتماد حسابك.</p>

<h2>٦. ملفات تعريف الارتباط وتقنيات التتبع</h2>
<p>نستخدم ملفات تعريف الارتباط وتقنيات تتبع مماثلة لتحسين تجربة التصفح لديك. تشمل هذه:</p>
<ul>
  <li><strong>ملفات تعريف الارتباط الأساسية:</strong> ضرورية لعمل المنصة بشكل صحيح</li>
  <li><strong>ملفات تعريف ارتباط التحليلات:</strong> تساعدنا على فهم كيفية تفاعل الزوار مع خدماتنا</li>
  <li><strong>ملفات تعريف ارتباط التفضيلات:</strong> تتذكر إعداداتك وتفضيلاتك</li>
</ul>
<p>يمكنك تعطيل ملفات تعريف الارتباط في إعدادات المتصفح، غير أن ذلك قد يؤثر على وظائف خدماتنا.</p>

<h2>٧. روابط الأطراف الثالثة</h2>
<p>قد تحتوي منصتنا على روابط لمواقع أو خدمات تابعة لجهات خارجية. لسنا مسؤولين عن ممارسات الخصوصية لدى تلك الأطراف. نشجعك على مراجعة سياسات الخصوصية الخاصة بهم قبل تقديم أي معلومات شخصية.</p>

<h2>٨. حقوقك</h2>
<p>بحسب موقعك الجغرافي، قد تتمتع بالحقوق التالية فيما يتعلق ببياناتك الشخصية:</p>
<ul>
  <li><strong>الوصول:</strong> طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك</li>
  <li><strong>التصحيح:</strong> طلب تصحيح البيانات غير الدقيقة أو غير المكتملة</li>
  <li><strong>المحو:</strong> طلب حذف بياناتك الشخصية، وفق شروط معينة</li>
  <li><strong>قابلية النقل:</strong> طلب نقل بياناتك إلى مزود خدمة آخر</li>
  <li><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض معينة</li>
</ul>
<p>لممارسة حقوقك، يرجى التواصل معنا على العنوان أدناه.</p>

<h2>٩. خصوصية الأطفال</h2>
<p>خدماتنا غير موجهة للأفراد دون سن الثامنة عشرة. لا نجمع عن قصد معلومات شخصية من الأطفال. إذا علمنا بأن طفلاً قد زودنا ببيانات شخصية، سنحذفها فوراً.</p>

<h2>١٠. التغييرات على هذه السياسة</h2>
<p>قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سنعلمك بأي تغييرات جوهرية بنشر السياسة الجديدة على منصتنا وتحديث تاريخ &ldquo;آخر تحديث&rdquo;. استمرارك في استخدام خدماتنا بعد هذه التغييرات يُعدّ قبولاً منك للسياسة المحدّثة.</p>

<h2>١١. اتصل بنا</h2>
<p>إذا كانت لديك أي أسئلة أو مخاوف أو طلبات تتعلق بسياسة الخصوصية هذه، يرجى التواصل معنا:</p>
<p>
  <strong>جيران للعقارات</strong><br>
  القاهرة، مصر<br>
  الهاتف: 4855 546 100 20+<br>
  البريد الإلكتروني: <a href="mailto:info@jeeran-realestate.com">info@jeeran-realestate.com</a><br>
  الموقع الإلكتروني: <a href="https://jeeran-realestate.com">www.jeeran-realestate.com</a>
</p>`;

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './privacy-policy.html',
  styleUrl:    './privacy-policy.scss',
})
export class PrivacyPolicyComponent implements OnInit {

  isLoading    = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage   = '';

  activeLang: LangTab  = 'en';
  viewMode:   ViewMode = 'edit';

  form: PrivacyPolicy = { content_en: DEFAULT_EN, content_ar: DEFAULT_AR };

  previewEn: SafeHtml = '';
  previewAr: SafeHtml = '';

  constructor(
    private service: PrivacyPolicyService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.service.get().subscribe({
      next: (res) => {
        // If backend returns empty, keep the default content
        this.form = {
          content_en: res.data?.content_en?.trim() || DEFAULT_EN,
          content_ar: res.data?.content_ar?.trim() || DEFAULT_AR,
        };
        this.isLoading = false;
        this.refreshPreviews();
        this.cdr.detectChanges();
      },
      error: () => {
        // On error keep defaults so content is never blank
        this.isLoading = false;
        this.refreshPreviews();
        this.cdr.detectChanges();
      },
    });
  }

  setLang(lang: LangTab): void   { this.activeLang = lang; }
  setMode(mode: ViewMode): void  {
    if (mode === 'preview') this.refreshPreviews();
    this.viewMode = mode;
  }

  refreshPreviews(): void {
    this.previewEn = this.sanitizer.bypassSecurityTrustHtml(this.form.content_en);
    this.previewAr = this.sanitizer.bypassSecurityTrustHtml(this.form.content_ar);
  }

  resetToDefault(): void {
    this.form.content_en = DEFAULT_EN;
    this.form.content_ar = DEFAULT_AR;
    this.refreshPreviews();
    this.cdr.detectChanges();
  }

  save(): void {
    if (!this.form.content_en.trim() && !this.form.content_ar.trim()) {
      this.errorMessage = 'At least one language content is required.';
      return;
    }
    this.isSubmitting   = true;
    this.errorMessage   = '';
    this.successMessage = '';

    this.service.update({ content_en: this.form.content_en, content_ar: this.form.content_ar }).subscribe({
      next: (res) => {
        this.form = {
          content_en: res.data?.content_en || this.form.content_en,
          content_ar: res.data?.content_ar || this.form.content_ar,
        };
        this.isSubmitting   = false;
        this.successMessage = 'Privacy policy saved successfully.';
        this.refreshPreviews();
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save privacy policy.';
        this.cdr.detectChanges();
      },
    });
  }
}
