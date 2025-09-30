import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

import { reportMfeRuntimeError } from './mfe-runtime-error-store';

import type { AppProps, LifeCycles } from 'single-spa';

interface CreateReactMfeOptions<TProps> {
  name: string;
  RootComponent: React.ComponentType<TProps>;
}

export function createReactMfe<TProps>({
  name,
  RootComponent
}: CreateReactMfeOptions<TProps>): LifeCycles<TProps> {
  return singleSpaReact({
    React,
    ReactDOMClient,
    renderType: 'createRoot',
    rootComponent: RootComponent as React.ComponentType<TProps & AppProps>,
    domElementGetter: (props: TProps & AppProps) => {
      const runtimeProps = props as Record<string, unknown>;
      const containerId =
        typeof runtimeProps.containerId === 'string'
          ? runtimeProps.containerId
          : `${name}-container`;
      const existing = document.getElementById(containerId);
      if (existing) {
        return existing;
      }
      const element = document.createElement('div');
      element.id = containerId;
      document.body.appendChild(element);
      return element;
    },
    errorBoundary: (error) => {
      reportMfeRuntimeError(name, error);
      return <></>;
    }
  });
}
