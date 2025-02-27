import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Card from './OverviewTabs/Card'
import OverviewContent from './OverviewTabs/OverviewContent'
const Main = () => {
  return (
      <Tabs defaultValue="overview" >
          <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="notification">Notification</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
              <Card></Card>
              <OverviewContent></OverviewContent>
              
          </TabsContent>
          <TabsContent value="analytics">Change your password here.</TabsContent>
      </Tabs>

  )
}

export default Main