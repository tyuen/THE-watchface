registerSettingsPage(props => {
  return (
    <Page>
      <Section title="Color">
        <ColorSelect
          settingsKey="theme"
          centered={true}
          colors={[
            {color: "tomato", value: "red"},
            {color: "sandybrown", value: "orange"},
            {color: "gold", value: "yellow"},
            {color: "lawngreen", value: "green"},
            {color: "deepskyblue", value: "blue"},
            {color: "plum", value: "purple"},
            {color: "mediumblue", value: "navy"},
            {color: "grey", value: "grey"},
            {color: "white", value: "white"}
          ]}
        />      
      </Section>

      <Section title="Health Rings &amp; Numbers" description="Tap on watch face to cycle through the numbers.">
        <Toggle settingsKey="hideRings" label="Hide rings" />
        <Select label="Default number"
          settingsKey="firstStat"
          options={[
            {name: "None", value: 6},
            {name: "Steps", value: 0},
            {name: "Heart Rate (bpm)", value: 1},
            {name: "Distance (km/mi)", value: 2},
            {name: "Floors Climbed (f)", value: 3},
            {name: "Calories Burned (cal)", value: 4},
            {name: "Active Time (hh'mm'')", value: 5}
          ]}
        />
        <Toggle settingsKey="unboldStats" label="Don't bold numbers" />
      </Section>
    </Page>
  );
});
