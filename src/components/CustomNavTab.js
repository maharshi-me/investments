import { Box, Tabs, Tab } from '@mui/material'

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const CustomNavTab = ({ tabs, value, setValue }) =>
  <Box sx={{ borderColor: 'divider', marginBottom: 3 }}>
    <Tabs value={tabs.indexOf(value)} onChange={(_event, newValue) => setValue(tabs[newValue])} >
      {tabs.map((tab, index) =>
        <Tab key={index} label={tab} {...a11yProps(index)} />
      )}
    </Tabs>
  </Box>

export default CustomNavTab
