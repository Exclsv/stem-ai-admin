// SidebarMenuMain.tsx
import React from "react";
import { useIntl } from "react-intl";
import { menuRoutes } from "./menuRoutes";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";

export interface MenuItem {
  to: string;
  icon: string;
  titleId: string;
  fontIcon: string;
  subItems?: SubMenuItem[];
  requiredPermissions?: string[];
}

interface SubMenuItem {
  to: string;
  titleId: string;
  hasBullet?: boolean;
  requiredPermissions?: string[];
}

const SidebarMenuMain: React.FC = React.memo(() => {
  const intl = useIntl();

  return (
    <>
      {menuRoutes.map((item: MenuItem, index: number) =>
        item.subItems ? (
          <SidebarMenuItemWithSub
            key={index}
            to={item.to}
            icon={item.icon}
            title={intl.formatMessage({ id: item.titleId })}
            fontIcon={item.fontIcon}
            requiredPermissions={item.requiredPermissions}
          >
            {item.subItems.map((subItem, subIndex) => (
              <SidebarMenuItem
                key={subIndex}
                to={subItem.to}
                title={intl.formatMessage({ id: subItem.titleId })}
                hasBullet={true}
                requiredPermissions={subItem.requiredPermissions}
              />
            ))}
          </SidebarMenuItemWithSub>
        ) : (
          <SidebarMenuItem
            key={index}
            to={item.to}
            icon={item.icon}
            title={intl.formatMessage({ id: item.titleId })}
            fontIcon={item.fontIcon}
            requiredPermissions={item.requiredPermissions}
          />
        )
      )}
    </>
  );
});

export { SidebarMenuMain };
