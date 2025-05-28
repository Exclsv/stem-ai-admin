import {ReactNode} from 'react'
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ScrollTopComponent,
  SwapperComponent,
  ToggleComponent
} from '../assets/ts/components'

type WithChildren = {
  children?: ReactNode
}

const reInitMenu = () => {
  setTimeout(() => {
    ToggleComponent.reinitialization();
    ScrollTopComponent.reinitialization();
    DrawerComponent.reinitialization();
    MenuComponent.reinitialization();
    ScrollComponent.reinitialization();
    SwapperComponent.reinitialization();
  }, 500);
}

export {type WithChildren, reInitMenu}
