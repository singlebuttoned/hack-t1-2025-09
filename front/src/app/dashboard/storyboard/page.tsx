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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Icon components organized by categories from Figma
const statusIcons = ['billing'] as const; // Using billing as coins/status icon
const graphsIcons = ['dashboard'] as const; // Dashboard represents graphs
const alertsIcons = ['warning'] as const;
const optionsIcons = ['settings'] as const;
const aboutIcons = ['help'] as const;
const burgerIcons = ['ellipsis'] as const; // Using ellipsis as burger menu

// Button component variations - matching Figma "Button" component set
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

// Burger Menu button variations - matching Figma "Button burger" component set
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

// Menu items - matching Figma "Menu" component set
const menuItems = [
  { label: 'Remote Control', variant: 'figma-primary' as const },
  { label: 'Remote Control', variant: 'figma-gradient' as const },
  { label: 'Remote Control', variant: 'figma-selected' as const }
];

// Form components - matching Figma form elements
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

export default function StoryboardPage() {
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
          {/* Icon Component Set - organized by categories */}
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

          {/* Button Component Set - matching Figma layouts */}
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
              <h3 className='text-lg font-medium'>
                Button Burger Component Set
              </h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='flex flex-col gap-4'>
                  {burgerButtonShowcase.map((item, index) => {
                    const IconComponent = Icons[item.icon];
                    return (
                      <Button
                        key={`burger-${item.variant}-${index}`}
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

          {/* Menu and Form Component Sets */}
          <section className='grid gap-6 lg:grid-cols-3'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Menu Component Set</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='flex flex-col gap-3'>
                  {menuItems.map((button, index) => (
                    <Button
                      key={`menu-${index}`}
                      variant={button.variant}
                      size='lg'
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Checkbox Components</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='space-y-6'>
                  {/* Checkboxes with text */}
                  <div className='space-y-2'>
                    <h4 className='text-muted-foreground text-sm font-medium'>
                      With Text
                    </h4>
                    <div className='grid gap-4'>
                      {checkboxShowcase.map(({ id, label, defaultChecked }) => (
                        <label
                          key={id}
                          htmlFor={id}
                          className='flex items-center gap-3 text-base'
                        >
                          <Checkbox id={id} defaultChecked={defaultChecked} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Checkboxes without text */}
                  <div className='space-y-2'>
                    <h4 className='text-muted-foreground text-sm font-medium'>
                      Without Text
                    </h4>
                    <div className='flex gap-4'>
                      {checkboxWithoutTextShowcase.map(
                        ({ id, defaultChecked }) => (
                          <Checkbox
                            key={id}
                            id={id}
                            defaultChecked={defaultChecked}
                            className='size-6'
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Switch Components</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='flex flex-col gap-4'>
                  <Button variant='secondary'>Text</Button>
                  <div className='space-y-3'>
                    {switchShowcase.map(({ id, label, defaultChecked }) => (
                      <div key={id} className='flex items-center gap-3'>
                        <Switch id={id} defaultChecked={defaultChecked} />
                        <Label htmlFor={id}>{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Interactive Components for Cursor Testing */}
          <section className='grid gap-6 lg:grid-cols-2'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Toggle Components</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='space-y-4'>
                  <Toggle
                    pressed={togglePressed}
                    onPressedChange={setTogglePressed}
                    aria-label='Toggle italic'
                  >
                    <Icons.settings className='h-4 w-4' />
                    Toggle Me
                  </Toggle>

                  <ToggleGroup type='multiple' className='justify-start'>
                    <ToggleGroupItem value='bold' aria-label='Toggle bold'>
                      <Icons.dashboard className='h-4 w-4' />
                    </ToggleGroupItem>
                    <ToggleGroupItem value='italic' aria-label='Toggle italic'>
                      <Icons.billing className='h-4 w-4' />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value='underline'
                      aria-label='Toggle underline'
                    >
                      <Icons.warning className='h-4 w-4' />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Tabs Component</h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <Tabs defaultValue='tab1' className='w-full'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='tab1'>Tab One</TabsTrigger>
                    <TabsTrigger value='tab2'>Tab Two</TabsTrigger>
                    <TabsTrigger value='tab3'>Tab Three</TabsTrigger>
                  </TabsList>
                  <TabsContent value='tab1' className='mt-4'>
                    <p className='text-muted-foreground text-sm'>
                      Content for tab one
                    </p>
                  </TabsContent>
                  <TabsContent value='tab2' className='mt-4'>
                    <p className='text-muted-foreground text-sm'>
                      Content for tab two
                    </p>
                  </TabsContent>
                  <TabsContent value='tab3' className='mt-4'>
                    <p className='text-muted-foreground text-sm'>
                      Content for tab three
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>

          {/* Interactive vs Non-Interactive Comparison */}
          <section className='grid gap-6 lg:grid-cols-2'>
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>
                Interactive Elements (Should Have Pointer)
              </h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='space-y-4'>
                  <Button variant='outline' size='sm'>
                    Clickable Button
                  </Button>

                  <div className='space-y-2'>
                    <Label htmlFor='test-checkbox'>Clickable Label</Label>
                    <Checkbox id='test-checkbox' />
                  </div>

                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className='w-full'
                  />

                  <Card
                    className='hover:bg-accent/50 cursor-pointer transition-colors'
                    onClick={() => alert('Card clicked!')}
                  >
                    <CardHeader>
                      <CardTitle className='text-sm'>Clickable Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground text-xs'>
                        This card is clickable
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>
                Non-Interactive Elements (Should NOT Have Pointer)
              </h3>
              <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
                <div className='space-y-4'>
                  <Badge variant='secondary'>Static Badge</Badge>

                  <Input type='text' placeholder='Text input (I-beam cursor)' />

                  <Textarea placeholder='Textarea (I-beam cursor)' />

                  <Progress value={33} className='w-full' />

                  <Separator />

                  <Card>
                    <CardHeader>
                      <CardTitle className='text-sm'>Static Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground text-xs'>
                        This card is not clickable
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Disabled Components Section */}
          <section className='space-y-4'>
            <h2 className='text-xl font-semibold'>
              Disabled Components (Should NOT Have Pointer)
            </h2>
            <div className='border-muted-foreground/40 rounded-xl border border-dashed p-6'>
              <div className='grid gap-6 lg:grid-cols-3'>
                <div className='space-y-4'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    Disabled Buttons
                  </h4>
                  <div className='space-y-2'>
                    <Button disabled>Disabled Default</Button>
                    <Button disabled variant='outline'>
                      Disabled Outline
                    </Button>
                    <Button disabled variant='secondary'>
                      Disabled Secondary
                    </Button>
                    <Button disabled variant='destructive'>
                      Disabled Destructive
                    </Button>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    Disabled Form Controls
                  </h4>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-2'>
                      <Checkbox disabled id='disabled-checkbox' />
                      <Label
                        htmlFor='disabled-checkbox'
                        className='text-muted-foreground'
                      >
                        Disabled Checkbox
                      </Label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Switch disabled id='disabled-switch' />
                      <Label
                        htmlFor='disabled-switch'
                        className='text-muted-foreground'
                      >
                        Disabled Switch
                      </Label>
                    </div>

                    <Toggle disabled aria-label='Disabled toggle'>
                      <Icons.settings className='h-4 w-4' />
                      Disabled Toggle
                    </Toggle>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    Disabled Inputs
                  </h4>
                  <div className='space-y-2'>
                    <Input disabled placeholder='Disabled text input' />
                    <Textarea disabled placeholder='Disabled textarea' />
                    <Button
                      disabled
                      variant='outline'
                      size='sm'
                      className='w-full'
                    >
                      Disabled Submit Button
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className='my-6' />

              <div className='space-y-3'>
                <h4 className='text-muted-foreground text-sm font-medium'>
                  Disabled Toggle Group
                </h4>
                <ToggleGroup disabled type='multiple' className='justify-start'>
                  <ToggleGroupItem value='bold' aria-label='Disabled bold'>
                    <Icons.dashboard className='h-4 w-4' />
                  </ToggleGroupItem>
                  <ToggleGroupItem value='italic' aria-label='Disabled italic'>
                    <Icons.billing className='h-4 w-4' />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value='underline'
                    aria-label='Disabled underline'
                  >
                    <Icons.warning className='h-4 w-4' />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
