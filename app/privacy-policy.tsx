import { View, ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function PrivacyPolicy() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText style={styles.title}>Privacy Policy</ThemedText>

        <ThemedText style={styles.section}>
          Last Updated: {new Date().toLocaleDateString()}
        </ThemedText>

        <ThemedText style={styles.section}>
          Effective Date: February 11, 2025 Last Updated: February 11, 2025
        </ThemedText>
        <ThemedText style={styles.section}>1. Introduction </ThemedText>
        <ThemedText style={styles.content}>
          PowerPlay ("we," "our," or "us") is committed to protecting your
          privacy. This Privacy Notice explains how we collect, use, disclose,
          and safeguard your information when you use our medical-related app
          (the "App"). By using the App, you consent to the practices described
          in this Privacy Notice.
        </ThemedText>
        <ThemedText style={styles.section}>
          2. Information We Collect
        </ThemedText>
        <ThemedText style={styles.content}>
          We may collect the following types of information: Personal
          Information: Name, email address, phone number, date of birth, and
          other identifying details. Health Information: Medical history,
          symptoms, prescriptions, and other health-related data provided by you
          or authorized healthcare providers. Usage Information: Device
          information, IP address, app usage analytics, and log data. Location
          Data: If you enable location tracking, we may collect and use your
          location data for relevant app features.
        </ThemedText>
        <ThemedText style={styles.section}>
          3. How We Use Your Information We use your information to:
        </ThemedText>
        <ThemedText style={styles.content}>
          Provide and improve the App's functionality and services. Facilitate
          communication with healthcare providers. Send health reminders,
          updates, or notifications. Ensure compliance with legal and regulatory
          obligations. Conduct research and analysis to enhance our services
          (with anonymized data where applicable).
        </ThemedText>
        <ThemedText style={styles.section}>
          4. How We Share Your Information We do not sell your personal
          information. We may share your data with:
        </ThemedText>
        <ThemedText style={styles.content}>
          Healthcare Providers: To facilitate your care and treatment. Service
          Providers: Third-party vendors assisting in app operations. Legal
          Authorities: When required by law, regulation, or legal process. With
          Your Consent: In any other situation where you explicitly authorize
          data sharing.
        </ThemedText>
        <ThemedText style={styles.section}>
          5. Data Security We implement industry-standard security measures to
          protect your data. However, no system is entirely secure, and we
          cannot guarantee absolute security.
        </ThemedText>
        <ThemedText style={styles.section}>
          6. Your Rights and Choices Depending on your location, you may have
          rights to:
        </ThemedText>
        <ThemedText style={styles.content}>
          Access, correct, or delete your data. Restrict or object to data
          processing. Withdraw consent where applicable. You can manage your
          preferences through the App settings or contact us at [Contact
          Information].
        </ThemedText>
        <ThemedText style={styles.section}>
          7. Data Retention We retain your information only as long as necessary
          to fulfill the purposes outlined in this Privacy Notice unless a
          longer retention period is required by law.
        </ThemedText>
        <ThemedText style={styles.section}>
          8. Third-Party Links and Services Our App may contain links to
          third-party websites or services. We are not responsible for their
          privacy practices, and we encourage you to review their privacy
          policies.
        </ThemedText>
        <ThemedText style={styles.section}>
          9. Children's Privacy Our App is not intended for individuals under 13
          years of age. If we become aware of collecting personal data from a
          child under 13, we will take steps to delete such information.
        </ThemedText>
        <ThemedText style={styles.section}>
          10. Changes to This Privacy Notice We may update this Privacy Notice
          from time to time. Any changes will be posted within the App, and we
          encourage you to review this page periodically.
        </ThemedText>
        <ThemedText style={styles.section}>
          11. Contact Us If you have any questions or concerns regarding this
          Privacy Notice, please contact us at: PowerPlay info@powerplay.com
        </ThemedText>
        </ScrollView>
    </ThemedView>); 
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
});
