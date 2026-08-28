import type { ExampleSet } from '../example-types'

/** Form controls. */
export const FORM_EXAMPLES: ExampleSet = {
  input: [
    {
      title: 'Sizes',
      name: 'sizes',
      code: `<Input size="sm" placeholder="Small" />
<Input size="md" placeholder="Medium" />
<Input size="lg" placeholder="Large" />`,
    },
    {
      title: 'Native types keep working',
      description:
        'There is no wrapper element, so type, autoComplete, min, max, pattern and the browser validation UI all behave exactly as they do on a bare input.',
      name: 'types',
      code: `<Input type="search" placeholder="Search components" />
<Input type="number" defaultValue={12} min={1} max={99} />
<Input type="date" defaultValue="2026-08-21" />
<Input disabled defaultValue="Disabled" />`,
    },
    {
      title: 'Inside a Field',
      description:
        'Field generates the id, wires the label, and points aria-describedby at the help text or aria-errormessage at the error. Do that by hand and one of the four eventually drifts.',
      name: 'field',
      code: `<Field label="Work email" help="We only use this for billing receipts.">
  <Input type="email" placeholder="you@company.com" />
</Field>

<Field label="Subdomain" error="That subdomain is already taken.">
  <Input invalid defaultValue="acme" />
</Field>`,
    },
  ],

  textarea: [
    {
      title: 'Sizes and resize',
      name: 'basic',
      code: `<Textarea placeholder="Default, resizable vertically" />
<Textarea size="sm" resize="none" placeholder="Small, resize disabled" />`,
    },
    {
      title: 'Inside a Field',
      name: 'field',
      code: `<Field label="Release notes" help="Markdown is supported.">
  <Textarea rows={4} placeholder="What changed in this version?" />
</Field>`,
    },
    {
      title: 'Invalid',
      description: 'invalid sets aria-invalid as well as the visual state, so both agree.',
      name: 'invalid',
      code: `<Field label="Summary" error="A summary is required.">
  <Textarea invalid rows={3} />
</Field>`,
    },
  ],

  label: [
    {
      title: 'Associate it with a control',
      description: 'htmlFor matches the input id. Field does this for you when you use it.',
      name: 'basic',
      code: `<Label htmlFor="name">Full name</Label>
<Input id="name" placeholder="Vivek Kumar Singh" />`,
    },
    {
      title: 'Required marker',
      description:
        'The asterisk is aria-hidden. The control’s own required attribute is what assistive technology reads - announcing "star" on every field is noise.',
      name: 'required',
      code: `<Label htmlFor="email" required>Work email</Label>
<Input id="email" type="email" required />`,
    },
  ],

  checkbox: [
    {
      title: 'With a description',
      description:
        'The description is linked with aria-describedby, so it is read after the label rather than being decoration.',
      name: 'basic',
      code: `<Checkbox
  label="Email me about releases"
  description="Roughly once a month. Unsubscribe from any email."
  defaultChecked
/>`,
    },
    {
      title: 'States',
      name: 'states',
      code: `<Checkbox label="Unchecked" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Disabled" disabled />
<Checkbox label="Invalid" invalid />`,
    },
  ],

  switch: [
    {
      title: 'A setting that applies immediately',
      description:
        'Use Switch when the change takes effect at once and Checkbox when it takes effect on submit. It is a real input with role="switch", so it posts in a form.',
      name: 'basic',
      code: `<Switch
  label="Two-factor authentication"
  description="Require a one-time code at sign-in."
  defaultChecked
/>
<Switch label="Weekly digest" description="A summary of activity every Monday." />
<Switch label="Disabled" disabled />`,
    },
    {
      title: 'Label first',
      name: 'labelPosition',
      code: `<Switch label="Control before label (default)" defaultChecked />
<Switch label="Control after label" labelPosition="start" defaultChecked />`,
    },
  ],

  'radio-group': [
    {
      title: 'One choice from a few',
      description:
        'Renders a real fieldset and legend, which is what groups the radios for a screen reader. Arrow keys move between options, as the ARIA practices require.',
      name: 'basic',
      code: `<RadioGroup
  name="plan"
  label="Plan"
  defaultValue="team"
  options={[
    { value: 'starter', label: 'Starter', description: 'Up to 3 projects' },
    { value: 'team', label: 'Team', description: 'Unlimited projects, 10 seats' },
    { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit log, SLA' },
  ]}
/>`,
    },
    {
      title: 'Horizontal',
      name: 'horizontal',
      code: `<RadioGroup
  name="billing"
  label="Billing period"
  orientation="horizontal"
  defaultValue="annual"
  options={[
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ]}
/>`,
    },
  ],

  listbox: [
    {
      title: 'Single select: selection follows focus',
      description:
        'The WAI-ARIA listbox pattern with roving focus. One option is in the tab order; arrows move between them and, like a native select, the focused option is the selected one. Home and End jump, typing a letter jumps to the next matching label. Disabled options stay listed and announced, and the keyboard skips them.',
      name: 'single',
      code: `<Listbox
  label="Deploy region"
  options={[
    { value: 'ap-south-1', label: 'Mumbai', description: 'ap-south-1' },
    { value: 'eu-west-1', label: 'Ireland', description: 'eu-west-1' },
    { value: 'eu-central-1', label: 'Frankfurt', disabled: true },
    { value: 'us-east-1', label: 'N. Virginia', description: 'us-east-1' },
  ]}
  value={region}
  onValueChange={setRegion}
/>`,
    },
    {
      title: 'Multiple select',
      description:
        'Focus and selection are separate, so moving changes nothing. Space toggles the focused option, Shift+Arrow moves and toggles, Ctrl/⌘+A selects every enabled option, and Shift+click selects the range from the last click. onValueChange receives a string[]; with name, one hidden input per value is emitted so the list posts with a plain form.',
      name: 'multiple',
      code: `<Listbox
  label="Alert channels"
  multiple
  name="channels"
  options={[
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push notification' },
    { value: 'slack', label: 'Slack' },
  ]}
  defaultValue={['email', 'push']}
  onValueChange={setChannels}
/>`,
    },
  ],

  select: [
    {
      title: 'Sizes',
      description:
        'A native select. It gets the platform picker on mobile, which no custom listbox matches for usability.',
      name: 'sizes',
      code: `<Select size="sm" options={regions} placeholder="Small" />
<Select size="md" options={regions} placeholder="Medium" />
<Select size="lg" options={regions} placeholder="Large" />
<Select invalid options={regions} placeholder="Invalid" />`,
    },
    {
      title: 'From data',
      description:
        'placeholder becomes a disabled, selected, hidden first option - the pattern that makes "nothing chosen yet" work without a fake empty value.',
      name: 'field',
      code: `<Field label="Region" help="Data never leaves the region you pick.">
  <Select
    options={[
      { value: 'ap-south-1', label: 'Mumbai (ap-south-1)' },
      { value: 'eu-west-1', label: 'Ireland (eu-west-1)' },
      { value: 'sa-east-1', label: 'Sao Paulo (sa-east-1)', disabled: true },
    ]}
    placeholder="Choose a region"
  />
</Field>`,
    },
    {
      title: 'Or your own children',
      description: 'Skip options and pass option and optgroup elements yourself.',
      name: 'children',
      code: `<Select defaultValue="team">
  <optgroup label="Paid">
    <option value="team">Team</option>
    <option value="enterprise">Enterprise</option>
  </optgroup>
  <optgroup label="Free">
    <option value="hobby">Hobby</option>
  </optgroup>
</Select>`,
    },
  ],

  'color-picker': [
    {
      title: 'Real controls',
      description:
        'Hue, saturation and brightness are range inputs with names and spoken values; the hex field commits on Enter or blur and reverts what it cannot parse; presets are pressed toggles. The 2D area is a pointer convenience over the same state. Emits lower-case hex; accepts #rgb, #rrggbbaa and rgb() on the way in.',
      name: 'default',
      code: `<ColorPicker
  label="Brand colour"
  value={brand}
  onValueChange={setBrand}
  presets={['#0f766e', '#1d4ed8', '#7c3aed', '#db2777']}
/>`,
    },
    {
      title: 'In a Field, behind a swatch, with alpha',
      description:
        'Field injects id, aria-describedby and invalid onto the hex input, so the label and error wire up like any other control. variant="popover" keeps the panel behind a swatch button; alpha adds a slider and eight-digit hex; name posts the value with a plain form.',
      name: 'field',
      code: `<Field label="Overlay tint" help="Alpha controls how much of the photo shows through.">
  <ColorPicker variant="popover" alpha name="tint" defaultValue="#11182780" />
</Field>`,
    },
  ],

  slider: [
    {
      title: 'A single value',
      description:
        'Arrow keys step, Home and End jump to the bounds, Page Up and Page Down take a larger step.',
      name: 'basic',
      code: `<Slider defaultValue={40} showValue aria-label="Volume" />
<Slider defaultValue={70} size="lg" tone="warning" showValue aria-label="Brightness" />
<Slider defaultValue={25} disabled showValue aria-label="Disabled" />`,
    },
    {
      title: 'Marks',
      description:
        'marks={true} derives ticks from step; pass an array for labelled stops. Useful when the scale is discrete rather than continuous.',
      name: 'marks',
      code: `<Slider defaultValue={3} min={1} max={5} step={1} marks showValue aria-label="Team size" />`,
    },
    {
      title: 'A range',
      description:
        'range={true} switches the value type to a tuple. It is a discriminated union, so TypeScript rejects a number here and a tuple in the single-value form.',
      name: 'range',
      code: `<Slider
  range
  defaultValue={[200, 800]}
  min={0}
  max={1000}
  step={50}
  showValue
  aria-label="Price range"
/>`,
    },
  ],

  'file-upload': [
    {
      title: 'A drop zone',
      description:
        'It is a real file input behind a labelled drop zone, so click, drag-and-drop, keyboard activation and the OS file picker all work. Selected files are listed with a remove button each.',
      name: 'basic',
      code: `<FileUpload
  multiple
  label="Attachments"
  hint="Drop files here, or click to browse."
  onFilesChange={setFiles}
/>`,
    },
    {
      title: 'Constraints',
      description:
        'Rejections are reported through onReject with a reason, rather than being dropped silently - the user needs to know their 12 MB file was refused.',
      name: 'constrained',
      code: `<FileUpload
  accept="image/png,image/jpeg"
  maxSize={2 * 1024 * 1024}
  maxFiles={3}
  multiple
  size="sm"
  label="Screenshots"
  hint="PNG or JPEG, up to 2 MB each, 3 files maximum."
  onReject={(rejections) => console.warn(rejections)}
/>`,
    },
  ],

  'password-input': [
    {
      title: 'With a reveal toggle',
      description:
        'The toggle is a button with a real accessible name, and the visibility state is controllable if you need to reset it on submit.',
      name: 'basic',
      code: `<PasswordInput placeholder="Your password" autoComplete="current-password" />
<PasswordInput size="sm" defaultVisible defaultValue="already visible" />
<PasswordInput invalid defaultValue="short" />`,
    },
    {
      title: 'Strength and rules',
      description:
        'You supply the rules, so the policy lives in your code rather than in the library. Each one shows pass or fail as the user types, which beats a single "too weak" verdict. Note that `test` is a function: the component holding these rules must be a Client Component, since a function cannot cross the server boundary.',
      name: 'strength',
      code: `<Field label="Choose a password" help="At least 12 characters, mixed case, and a digit.">
  <PasswordInput
    strength
    rules={[
      { id: 'length', label: 'At least 12 characters', test: (v) => v.length >= 12 },
      { id: 'case', label: 'Upper and lower case', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
      { id: 'digit', label: 'At least one digit', test: (v) => /\\d/.test(v) },
    ]}
  />
</Field>`,
    },
  ],

  'time-picker': [
    {
      title: 'Office hours',
      description:
        'Hours and minutes as spinbutton segments. Typed digits accumulate and focus advances, arrows step and wrap, and a committed value is clamped into min/max rather than refused - refusing makes typing 9 impossible when the minimum is 09:30. A half-entered time is null, never a guess.',
      name: 'default',
      code: `const [start, setStart] = useState<string | null>('09:30')

<Field label="Start" help="Office hours only">
  <TimePicker name="start" min="09:00" max="17:30" value={start} onValueChange={setStart} />
</Field>

// The form receives start=09:30. The value is always 24-hour 'HH:mm'.`,
    },
    {
      title: '12-hour display, 24-hour value',
      description:
        'hourCycle changes what is shown and how AM/PM is entered; onValueChange still receives 14:30. Chosen explicitly rather than from Intl, because a field that renders 24-hour on the server and 12-hour in the browser is a hydration mismatch.',
      name: 'twelveHour',
      code: `<TimePicker defaultValue="14:30" hourCycle={12} withSeconds name="kickoff" />

// Displays 02 : 30 : 00 PM. Type A or P on the period segment to switch.
// onValueChange -> '14:30:00'`,
    },
  ],

  'otp-input': [
    {
      title: 'A verification code',
      description:
        'Pasting the whole code fills every box at once, which is how people actually enter these. Backspace walks back, arrows move, and the value is one string rather than N pieces of state.',
      name: 'basic',
      code: `<Field label="Verification code">
  <OTPInput length={6} onComplete={verify} />
</Field>`,
    },
    {
      title: 'Masked and alphanumeric',
      name: 'masked',
      code: `<OTPInput length={4} mask type="numeric" size="lg" />
<OTPInput length={8} type="alphanumeric" size="sm" />`,
    },
  ],

  'tag-input': [
    {
      title: 'A list of tags',
      description:
        'Enter or a delimiter commits a tag; Backspace in an empty box removes the last one. Each chip has its own labelled remove button, so a keyboard user is not stuck.',
      name: 'basic',
      code: `<TagInput
  defaultValue={['react', 'typescript', 'accessibility']}
  placeholder="Add a topic"
  aria-label="Topics"
  onValueChange={setTopics}
/>`,
    },
    {
      title: 'Validated',
      description:
        'validate returns true, false, or a message shown to the user. Returning the reason is what turns a silent rejection into something fixable. Being a function, it also means the surrounding component has to be a Client Component.',
      name: 'validated',
      code: `<Field label="Invite by email" help="Type an address and press Enter or comma.">
  <TagInput
    max={5}
    delimiters={[',', ' ']}
    addOnBlur
    validate={(tag) => (tag.includes('@') ? true : 'That is not an email address')}
    placeholder="name@company.com"
  />
</Field>`,
    },
  ],

  rating: [
    {
      title: 'Pick a rating',
      description:
        'A real radio group under the icons, so arrow keys work and it submits in a form. allowClear lets someone undo a mis-click, which a plain radio group cannot.',
      name: 'basic',
      code: `<Rating defaultValue={4} label="How was your experience?" allowClear />
<Rating defaultValue={3} allowHalf size="lg" label="Half steps" />
<Rating defaultValue={2} max={10} size="sm" label="Out of ten" />`,
    },
    {
      title: 'Read-only',
      description:
        'For displaying an average. It renders as text to assistive technology rather than as a control nobody can operate.',
      name: 'readOnly',
      code: `<Rating value={4} readOnly label="Average rating" />
<Rating value={3.5} allowHalf readOnly size="sm" label="With halves" />`,
    },
  ],

  combobox: [
    {
      title: 'Filterable single select',
      description:
        'Full ARIA combobox behaviour: aria-activedescendant, arrow keys, Home and End, Escape to close, and the listbox linked to the input.',
      name: 'basic',
      code: `<Combobox
  options={[
    { value: 'next', label: 'Next.js' },
    { value: 'remix', label: 'Remix' },
    { value: 'astro', label: 'Astro' },
  ]}
  defaultValue="next"
  aria-label="Framework"
  onValueChange={setFramework}
/>`,
    },
    {
      title: 'Multiple',
      description:
        'multiple flips the value type from string to string[]. A discriminated union, so the wrong handler signature is a compile error.',
      name: 'multiple',
      code: `<Field label="Frameworks">
  <Combobox multiple options={frameworks} defaultValue={['next', 'astro']} />
</Field>`,
    },
    {
      title: 'Creatable',
      description: 'creatable offers the typed text as a new option when nothing matches.',
      name: 'creatable',
      code: `<Combobox
  options={frameworks}
  creatable
  onCreate={(label) => addFramework(label)}
  placeholder="Search or add your own"
  aria-label="Framework"
/>`,
    },
  ],

  calendar: [
    {
      title: 'Pick a date',
      description:
        'A grid with real roving focus: arrows move a day, Page Up and Page Down move a month, Home and End reach the week bounds.',
      name: 'basic',
      code: `<Calendar defaultValue={new Date(2026, 7, 21)} onValueChange={setDate} />`,
    },
    {
      title: 'A range',
      description:
        'mode="range" changes the value to { start, end }. The union means the single-date handler will not typecheck here.',
      name: 'range',
      code: `<Calendar
  mode="range"
  defaultValue={{ start: new Date(2026, 7, 12), end: new Date(2026, 7, 19) }}
  onValueChange={setRange}
/>`,
    },
    {
      title: 'Bounds and blocked dates',
      description:
        'disabledDates takes a list or a predicate, so "no weekends" and "not these holidays" both fit without a second prop. The predicate form needs a Client Component around it - it has to run for months the server never rendered - while an array of Dates crosses the boundary fine.',
      name: 'bounded',
      code: `<Calendar
  min={new Date(2026, 7, 10)}
  max={new Date(2026, 7, 28)}
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
  weekStartsOn={1}
/>`,
    },
  ],

  'date-range-picker': [
    {
      title: 'A stay',
      description:
        'One trigger reading start – end, a popup hosting Calendar in range mode. It closes on the second date and returns focus to the field; Escape after a first click restores the last complete range instead of leaving one date of two in the form.',
      name: 'default',
      code: `const [stay, setStay] = useState({ start: null, end: null })

<Field label="Stay">
  <DateRangePicker name="stay" value={stay} onValueChange={setStay} />
</Field>

// The form receives two ISO fields: stay-start and stay-end.
// The trigger's accessible name reads the range in words:
// "Stay: March 12, 2026 to March 15, 2026".`,
    },
    {
      title: 'Bounded, weekends refused',
      description:
        'min, max and disabledDates pass straight through to Calendar, where a disabled day is unreachable by keyboard rather than merely unclickable.',
      name: 'bounded',
      code: `<DateRangePicker
  min={new Date(2026, 2, 1)}
  max={new Date(2026, 2, 31)}
  disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
  name="workshop"
/>`,
    },
  ],

  'date-picker': [
    {
      title: 'A text field with a calendar',
      description:
        'Typing a date works on its own - the calendar is an aid, not the only way in. That matters because a keyboard user entering a birth date should not have to page through years.',
      name: 'basic',
      code: `<DatePicker defaultValue={new Date(2026, 7, 21)} aria-label="Start date" onValueChange={setDate} />
<DatePicker size="sm" placeholder="dd/mm/yyyy" aria-label="End date" />`,
    },
    {
      title: 'Bounded',
      description:
        'min and max are plain Dates and cross a server boundary fine. disabledDates as a predicate does not, so use the array form or mark the surrounding component "use client".',
      name: 'bounded',
      code: `<Field label="Delivery date" help="Weekends are unavailable.">
  <DatePicker
    min={new Date(2026, 7, 21)}
    max={new Date(2026, 8, 30)}
    disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
    weekStartsOn={1}
  />
</Field>`,
    },
  ],
}
