import type { Icons } from '@/components/icons';

import type { LifeCycles } from 'single-spa';

declare const pathPrefixBrand: unique symbol;

/**
 * Must start from / and not have trailing /
 * */
export type PathPrefix = string & { readonly [pathPrefixBrand]: true };

export interface MicroFrontendDefinitionInput {
  key: string;
  /** Path prefix for the micro frontend, must start from / and never have trailing / */
  pathPrefix: PathPrefix;
  title: string;
  icon: keyof typeof Icons;
  containerId: string;
  loader: () => Promise<LifeCycles>;
}

export interface EditionConfigInput {
  key: string;
  label: string;
  description?: string;
  mfes: string[];
}
export interface MicroFrontendRuntimeProps {
  basename?: string;
  containerId?: string;
}
