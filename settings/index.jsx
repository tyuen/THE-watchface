function isNotEmpty(list) {
  list = list && JSON.parse(list);
  list = list && list.values;
  return list && (list.length === 1 ? list[0].value !== "none" : list.length > 1);
}

function getClampedFirstStat(props) {
  let first = props.settingsStorage.getItem("firstStat2");
  let stats = props.settingsStorage.getItem("stats");
  if(first && stats) {
    return Math.min(JSON.parse(first).selected[0], JSON.parse(stats).selected.length - 1);
  }
}

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

      <Section title="Health Rings">
        <Toggle settingsKey="hideRings" label="Hide rings" />
      </Section>  

      <Section title="Health Stats" description="Tap on bottom half of watch face to cycle through the stats.">
        <Select label="Show Stats"
          multiple
          selectViewTitle="Show Stats"
          settingsKey="stats"
          options={[
            {name: "None", value: "none"},
            {name: "Steps", value: "steps"},
            {name: "Heart Rate (bpm)", value: "heart"},
            {name: "Resting Heart Rate (- bpm -)", value: "rest"},
            {name: "Distance (km/mi)", value: "dist"},
            {name: "Floors Climbed (f)", value: "floors"},
            {name: "Calories Burned (cal)", value: "cals"},
            {name: "Active Time (hh'mm'')", value: "mins"},
            {name: "Weight (kg/lb)", value: "weight"},
            {name: "Digital Time", value: "time"},
            {name: "Battery", value: "batt"}
          ]}
        />        

        {(isNotEmpty(props.settings.stats) ?
          <Select label="Default"
            selectViewTitle="Default Stat"
            options={JSON.parse(props.settings.stats).values}
            onSelection={sel => props.settingsStorage.setItem("firstStat2", JSON.stringify(sel))}
            selected={getClampedFirstStat(props)}
          /> : null)}
       
        <Toggle settingsKey="unboldStats" label="Narrow Font" />
      </Section>
    </Page>
  );
});
