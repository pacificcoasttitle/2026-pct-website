import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useHostTheme,
} from 'cursor/canvas';

const subsystems = [
  ['Public vCards', 'PHP', 'index.php, templates/vcard.php', 'Reads employees, renders cards, tracks views, downloads VCF'],
  ['Admin panel', 'PHP', 'admin/*.php, auth.php', 'Session auth, role checks, employee CRUD, dashboards'],
  ['SMS Studio', 'PHP + Flask', 'admin/social-media-sms-v2.php, render-deploy/app.py', 'Uploads images, routes by sms_code, sends Twilio SMS/MMS'],
  ['Email Studio', 'PHP + Python', 'email-marketing-v2.php, master-email-marketing/core-system', 'Edits templates, generates rep HTML, creates Mailchimp campaigns'],
  ['Farm Requests', 'Static HTML + PHP', 'farm-request/index.html, api.php', 'Client list requests, rep attribution, database save, email notice'],
  ['Assessments', 'Static HTML + PHP', 'assessment/index.html, api.php', 'Tool survey responses, scoring, rep notification'],
  ['Questions App', 'Next.js', 'questions/app', 'Separate App Router experiment with Postgres routes'],
];

const flows = [
  ['vCard view', 'Browser -> index.php -> getEmployee() -> templates/vcard.php -> employee_activity/view_count'],
  ['Rep admin edit', 'AdminAuth -> vcard-admin-v2.php -> addNewEmployee/editEmployee/toggleEmployee/deleteEmployee -> employees'],
  ['MMS send', 'SMS Studio upload -> /social-media-sms/sent -> Render /api/send-batch -> employees -> Twilio'],
  ['Text/link send', 'SMS Studio text/farm/assessment action -> Render /api/send-text-batch -> employees.sms_code/mobile -> Twilio'],
  ['Mailchimp campaign', 'Email Studio -> campaign_manager.py -> template_generator.py -> Mailchimp templates/campaigns/schedule'],
  ['Farm lead', 'Client form -> farm-request/api.php -> farm_requests -> mail() to rep or fallback'],
  ['Assessment', 'Client form -> assessment/api.php -> assessments -> PHPMailer notification -> admin responses view'],
];

const repModels = [
  ['employees table', 'Canonical for vCards, admin, SMS, farm, assessments', 'slug, sms_code, office_id, department_id, mobile, website fields'],
  ['sales_reps_data.json', 'Mailchimp campaign automation source', 'id, name, email, phone, audience_name/list ID, region, logos'],
  ['admin_users table', 'Who can manage reps', 'top_level or manager; managers scoped by office in some read paths'],
];

const risks = [
  ['Secrets in repo/docs', 'Credential-like values appear in configuration files/docs; values should not be copied into reports.', 'High'],
  ['Two rep catalogs', 'employees and sales_reps_data.json can drift, especially for Mailchimp audiences.', 'Medium'],
  ['Manager enforcement gaps', 'Some mutations rely on UI scope more than server-side office checks.', 'Medium'],
  ['SMS API exposure', 'Render API endpoints are documented as internal and not keyed in the reviewed code/docs.', 'Medium'],
  ['Verbose production logging', 'index.php and SMS API log detailed request/routing data.', 'Medium'],
  ['Build artifacts checked in', 'questions/app contains .next output, likely stale and noisy.', 'Low'],
];

export default function VcardNewSystemMap() {
  const { tokens: t } = useHostTheme();

  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>vcard-new System Map</H1>
        <Text tone="secondary">
          Read-only architecture review of the PHP vCard platform, rep management, SMS Studio, Mailchimp automation, lead forms, assessments, and migration artifacts.
        </Text>
        <Row gap={8} wrap>
          <Pill tone="info" active>PHP/MySQL core</Pill>
          <Pill>Render Flask SMS API</Pill>
          <Pill>Mailchimp Python automation</Pill>
          <Pill>Static public forms</Pill>
          <Pill>Next.js side app</Pill>
        </Row>
      </Stack>

      <Grid columns={4} gap={14}>
        <Stat value="7" label="Major subsystems" tone="info" />
        <Stat value="3" label="Rep data surfaces" tone="warning" />
        <Stat value="5" label="SMS API endpoints" />
        <Stat value="2" label="Sensitive docs flagged" tone="danger" />
      </Grid>

      <Divider />

      <H2>Subsystems</H2>
      <Table
        headers={['Area', 'Stack', 'Primary files', 'Purpose']}
        rows={subsystems}
        striped
        stickyHeader
      />

      <H2>Representative Model</H2>
      <Grid columns="1.2fr 1fr" gap={16}>
        <Stack gap={10}>
          <Text>
            The canonical operational record is the MySQL `employees` row. The two most important identifiers are `slug` for public vCard URLs and `sms_code` for SMS routing and form attribution.
          </Text>
          <Text>
            Mailchimp is the exception: campaigns are generated from `master-email-marketing/core-system/sales_reps_data.json`, where `audience_name` is actually the Mailchimp audience/list ID.
          </Text>
        </Stack>
        <Table
          headers={['Source', 'Used by', 'Important fields']}
          rows={repModels}
          framed
        />
      </Grid>

      <H2>Main Data Flows</H2>
      <Table
        headers={['Flow', 'Path']}
        rows={flows}
        striped
      />

      <Grid columns={3} gap={16}>
        <Card>
          <CardHeader trailing={<Pill size="sm" tone="info">Core</Pill>}>Public vCard</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>`index.php` resolves `employee` or `e`, loads via `findEmployeeWithVariations()`, tracks non-bot views, then includes the matching template.</Text>
              <Text tone="secondary" size="small">Actions: `view`, `qr`, `download`, `print`; empty employee shows the directory.</Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader trailing={<Pill size="sm" tone="warning">Routing</Pill>}>SMS Studio</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>MMS images are stored publicly, then Render resolves recipients from active employees with mobile numbers.</Text>
              <Text tone="secondary" size="small">Routing modes: filename `C-28`, sequential fallback, or `send_to_all` for one image to every rep.</Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader trailing={<Pill size="sm" tone="info">Automation</Pill>}>Mailchimp</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>Email Studio edits/saves HTML, then shells out to Python to generate per-rep templates and schedule Mailchimp campaigns.</Text>
              <Text tone="secondary" size="small">No member subscribe API path was found in the Mailchimp manager.</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>Risks And Oddities</H2>
      <Table
        headers={['Risk', 'Observation', 'Severity']}
        rows={risks}
        rowTone={['danger', 'warning', 'warning', 'warning', 'warning', undefined]}
        striped
      />

      <H2>Files To Keep In Mind</H2>
      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Implementation spine</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>`vcard-new/index.php`</Text>
              <Text>`vcard-new/api/functions_mysql.php`</Text>
              <Text>`vcard-new/admin/auth.php`</Text>
              <Text>`vcard-new/admin/vcard-admin-v2.php`</Text>
              <Text>`vcard-new/templates/vcard.php`</Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Marketing systems</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>`vcard-new/admin/social-media-sms-v2.php`</Text>
              <Text>`vcard-new/social-media-sms/render-deploy/app.py`</Text>
              <Text>`vcard-new/admin/email-marketing-v2.php`</Text>
              <Text>`vcard-new/master-email-marketing/core-system/*.py`</Text>
              <Text>`vcard-new/master-email-marketing/core-system/sales_reps_data.json`</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Text tone="tertiary" size="small">
        Note: Sensitive credential values were intentionally excluded from this artifact.
      </Text>
    </Stack>
  );
}
