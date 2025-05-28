import React from "react";
import clsx from "clsx";
import { useLocation } from "react-router";
import { useLayout } from "../../../core";
import { useAuth } from "../../../../../app/modules/auth";
import { checkIsActive, KTIcon, WithChildren } from "../../../../helpers";

type Props = {
  to: string;
  title: string;
  icon?: string;
  fontIcon?: string;
  hasBullet?: boolean;
  requiredPermissions?: string[];
};

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet,
  requiredPermissions,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const { config } = useLayout();
  const { app } = config;
  // const { hasAnyPermission } = useAuth();

  // if (!hasAnyPermission(requiredPermissions || [])) {
  //   return <></>;
  // }

  return (
    <div
      className={clsx("menu-item", { "here show": isActive }, "menu-accordion")}
      data-kt-menu-trigger="click"
    >
      <span className="menu-link">
        {hasBullet && (
          <span className="menu-bullet">
            <span className="bullet bullet-dot"></span>
          </span>
        )}
        {icon && app?.sidebar?.default?.menu?.iconType === "svg" && (
          <span className="menu-icon">
            <KTIcon iconName={icon} className="fs-2" />
          </span>
        )}
        {fontIcon && app?.sidebar?.default?.menu?.iconType === "font" && (
          <i className={clsx("bi fs-3", fontIcon)}></i>
        )}
        <span className="menu-title">{title}</span>
        <span className="menu-arrow"></span>
      </span>
      <div
        className={clsx("menu-sub menu-sub-accordion", {
          "menu-active-bg": isActive,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export { SidebarMenuItemWithSub };
