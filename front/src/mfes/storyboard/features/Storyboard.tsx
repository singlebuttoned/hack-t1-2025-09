'use client';

import { useState } from 'react';

import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const statusIcons = ['billing'] as const;
const graphsIcons = ['dashboard'] as const;
const alertsIcons = ['warning'] as const;
const optionsIcons = ['settings'] as const;
const aboutIcons = ['help'] as const;
const burgerIcons = ['ellipsis'] as const;

const buttonShowcase = [
  {
    icon: 'billing' as keyof typeof Icons,
    label: 'Device Status',
    variant: 'figma-primary' as const,
    iconColor: 'text-muted-foreground',
    size: 'default' as const
  },
  {
    icon: 'billing' as keyof typeof Icons,
    label: 'Device Status',
    variant: 'figma-secondary' as const,
    iconColor: 'text-accent',
    size: 'default' as const
  },
  {
    icon: 'billing' as keyof typeof Icons,
    label: 'Device Status',
    variant: 'figma-selected' as const,
    iconColor: 'text-sidebar-primary-foreground',
    size: 'default' as const
  }
];

const burgerButtonShowcase = [
  {
    icon: 'ellipsis' as keyof typeof Icons,
    label: 'Close Menu',
    variant: 'figma-primary' as const,
    iconColor: 'text-muted-foreground'
  },
  {
    icon: 'ellipsis' as keyof typeof Icons,
    label: 'Close Menu',
    variant: 'figma-secondary' as const,
    iconColor: 'text-accent'
  },
  {
    icon: 'ellipsis' as keyof typeof Icons,
    label: 'Close Menu',
    variant: 'figma-selected' as const,
    iconColor: 'text-sidebar-primary-foreground'
  }
];

const menuItems = [
  { label: 'Remote Control', variant: 'figma-primary' as const },
  { label: 'Remote Control', variant: 'figma-gradient' as const },
  { label: 'Remote Control', variant: 'figma-selected' as const }
];

const checkboxShowcase = [
  { id: 'storyboard-checkbox-off', label: 'Text', defaultChecked: false },
  { id: 'storyboard-checkbox-on', label: 'Text', defaultChecked: true }
];

const checkboxWithoutTextShowcase = [
  { id: 'storyboard-checkbox-no-text-off', defaultChecked: false },
  { id: 'storyboard-checkbox-no-text-on', defaultChecked: true }
];

const switchShowcase = [
  { id: 'toggle-off', label: 'Toggle Off', defaultChecked: false },
  { id: 'toggle-on', label: 'Toggle On', defaultChecked: true }
];

export function Storyboard() {
  const [sliderValue, setSliderValue] = useState([50]);
  const [togglePressed, setTogglePressed] = useState(false);

  return (
    <PageContainer>
      <div className='flex w-full flex-col gap-8'>
        <header className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight'>
            UI Component Storyboard
          </h1>
          <p className='text-muted-foreground max-w-2xl'>
            Visual reference for dashboard components arranged to match the
            Figma design system. Components are organized by type: Buttons,
            Icons, Menus, and Form elements.
          </p>
        </header>

        <div className='flex flex-col gap-8'>
          <section className='space-y-4'>
            <h2 className='text-xl font-semibold'>Icon Component Set</h2>
            <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
              <div className='grid grid-cols-6 gap-6 lg:grid-cols-8'>
                {[
                  ...statusIcons,
                  ...graphsIcons,
                  ...alertsIcons,
                  ...optionsIcons,
                  ...aboutIcons,
                  ...burgerIcons
                ].map((iconKey) => {
                  const IconComponent = Icons[iconKey];
                  return (
                    <div
                      key={iconKey}
                      className='bg-card flex h-16 w-16 items-center justify-center rounded-lg border shadow-sm'
                    >
                      <IconComponent className='text-muted-foreground size-6' />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className='grid gap-6 lg:grid-cols-2'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Button Component Set</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='flex flex-col gap-4'>
                  {buttonShowcase.map((item, index) => {
                    const IconComponent = Icons[item.icon];
                    return (
                      <Button
                        key={`${item.variant}-${index}`}
                        variant={item.variant}
                        className='justify-start gap-3'
                        size='lg'
                      >
                        <IconComponent className={`size-4 ${item.iconColor}`} />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Burger Menu Buttons</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='flex flex-col gap-4'>
                  {burgerButtonShowcase.map((item, index) => {
                    const IconComponent = Icons[item.icon];
                    return (
                      <Button
                        key={`${item.variant}-${index}`}
                        variant={item.variant}
                        className='justify-start gap-3'
                        size='lg'
                      >
                        <IconComponent className={`size-4 ${item.iconColor}`} />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className='grid gap-6 lg:grid-cols-2'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Menu Component Variants</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='grid gap-4'>
                  {menuItems.map((item, index) => (
                    <Button
                      key={`${item.variant}-${index}`}
                      variant={item.variant}
                      className='justify-start'
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Status Cards</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <Card className='rounded-xl border'>
                    <CardHeader className='align-center flex flex-row items-center justify-between'>
                      <CardTitle className='text-base font-medium'>
                        System
                      </CardTitle>
                      <Badge className='bg-emerald-500 text-white hover:bg-emerald-500/90'>
                        Active
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground text-sm'>
                        System is operating normally with no detected issues.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className='rounded-xl border'>
                    <CardHeader className='align-center flex flex-row items-center justify-between'>
                      <CardTitle className='text-base font-medium'>
                        Alerts
                      </CardTitle>
                      <Badge variant='destructive'>5</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground text-sm'>
                        Pending alerts require review and acknowledgment.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <section className='space-y-4'>
            <h3 className='text-lg font-medium'>Progress & Metrics</h3>
            <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Device Health</span>
                    <span className='text-muted-foreground text-sm font-medium'>
                      78%
                    </span>
                  </div>
                  <Progress value={78} className='h-2 rounded-full' />
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>System Load</span>
                    <span className='text-muted-foreground text-sm font-medium'>
                      45%
                    </span>
                  </div>
                  <Progress value={45} className='h-2 rounded-full' />
                </div>
              </div>
            </div>
          </section>

          <section className='grid gap-6 md:grid-cols-2'>
            <Card className='border'>
              <CardHeader>
                <CardTitle>User Permissions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='user-role'>Role</Label>
                  <Input id='user-role' placeholder='Administrator' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='access-level'>Access Level</Label>
                  <Slider
                    id='access-level'
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    className='max-w-sm'
                  />
                </div>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-1'>
                    <Label htmlFor='access-status'>Access Status</Label>
                    <p className='text-muted-foreground text-xs'>
                      Automatic closing enabled
                    </p>
                  </div>
                  <Switch id='access-status' defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className='border'>
              <CardHeader>
                <CardTitle>System Controls</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label htmlFor='system-toggle'>Remote Access</Label>
                  <Switch id='system-toggle' defaultChecked />
                </div>
                <div className='flex items-center justify-between rounded-lg border p-3'>
                  <Label htmlFor='maintenance-mode'>Maintenance Mode</Label>
                  <Switch id='maintenance-mode' />
                </div>
                <div className='space-y-2'>
                  <Label>Device Group</Label>
                  <Tabs defaultValue='primary'>
                    <TabsList className='grid grid-cols-2'>
                      <TabsTrigger value='primary'>Primary</TabsTrigger>
                      <TabsTrigger value='backup'>Backup</TabsTrigger>
                    </TabsList>
                    <TabsContent value='primary'>
                      <p className='text-muted-foreground text-sm'>
                        Controls for primary device cluster.
                      </p>
                    </TabsContent>
                    <TabsContent value='backup'>
                      <p className='text-muted-foreground text-sm'>
                        Controls for backup device cluster.
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className='grid gap-6 md:grid-cols-2'>
            <Card className='border'>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {switchShowcase.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <Label htmlFor={item.id}>{item.label}</Label>
                    <Switch id={item.id} defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className='border'>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <Button variant='figma-primary'>Restart</Button>
                  <Button variant='figma-secondary'>Backup</Button>
                  <Button variant='figma-selected'>Diagnostics</Button>
                  <Button variant='figma-gradient'>Update</Button>
                </div>
                <Separator />
                <ToggleGroup
                  type='single'
                  variant='outline'
                  className='grid grid-cols-3 gap-2'
                  value={togglePressed ? 'enabled' : ''}
                  onValueChange={(value) =>
                    setTogglePressed(value === 'enabled')
                  }
                >
                  <ToggleGroupItem value='enabled'>Enabled</ToggleGroupItem>
                  <ToggleGroupItem value='disabled'>Disabled</ToggleGroupItem>
                  <ToggleGroupItem value='scheduled'>Scheduled</ToggleGroupItem>
                </ToggleGroup>
              </CardContent>
            </Card>
          </section>

          <section className='grid gap-6 md:grid-cols-2'>
            <Card className='border'>
              <CardHeader>
                <CardTitle>Maintenance Notes</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Textarea
                  placeholder='Document maintenance activity...'
                  className='min-h-[120px]'
                />
                <Button variant='figma-primary'>Save Note</Button>
              </CardContent>
            </Card>

            <Card className='border'>
              <CardHeader>
                <CardTitle>Activity Checklist</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {checkboxShowcase.map((item) => (
                  <div key={item.id} className='flex items-center gap-3'>
                    <Checkbox
                      id={item.id}
                      defaultChecked={item.defaultChecked}
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
                <Separator />
                <div className='flex flex-col gap-3'>
                  {checkboxWithoutTextShowcase.map((item) => (
                    <Checkbox
                      key={item.id}
                      id={item.id}
                      defaultChecked={item.defaultChecked}
                      aria-label='Toggle option'
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
