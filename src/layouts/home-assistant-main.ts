import {
  LitElement,
  html,
  TemplateResult,
  CSSResult,
  css,
  PropertyValues,
  property,
} from "lit-element";
import "@polymer/app-layout/app-drawer-layout/app-drawer-layout";
// import "@polymer/app-layout/app-drawer/app-drawer"; // IoB
// Not a duplicate, it's for typing
// tslint:disable-next-line
import { AppDrawerElement } from "@polymer/app-layout/app-drawer/app-drawer";
import "@polymer/iron-media-query/iron-media-query";

import "./partial-panel-resolver";
import { HomeAssistant, Route } from "../types";
import { fireEvent } from "../common/dom/fire_event";
import { PolymerChangedEvent } from "../polymer-types";

const NON_SWIPABLE_PANELS = ["kiosk", "map"];

declare global {
  // for fire event
  interface HASSDomEvents {
    "hass-toggle-menu": undefined;
  }
}

class HomeAssistantMain extends LitElement {
  @property() public hass?: HomeAssistant;
  @property() public route?: Route;
  @property() private _narrow?: boolean;

  protected render(): TemplateResult | void {
    const hass = this.hass;

    if (!hass) {
      return;
    }

    const disableSwipe = NON_SWIPABLE_PANELS.indexOf(hass.panelUrl) !== -1;

    return html`
      <iron-media-query
        query="(max-width: 870px)"
        @query-matches-changed=${this._narrowChanged}
      ></iron-media-query>

      <app-drawer-layout
        fullbleed
        .forceNarrow=${this._narrow || !hass.dockedSidebar}
        responsive-width="0"
      >
		<!-- Disabled for IoB -->
        <!--app-drawer
          id="drawer"
          align="start"
          slot="drawer"
          .disableSwipe=${disableSwipe}
          .swipeOpen=${!disableSwipe}
          .persistent=${hass.dockedSidebar}
        >
          <ha-sidebar .hass=${hass}></ha-sidebar>
        </app-drawer-->

        <partial-panel-resolver
          .narrow=${this._narrow}
          .hass=${hass}
          .route=${this.route}
        ></partial-panel-resolver>
      </app-drawer-layout>
    `;
  }

  protected firstUpdated() {
    // import(/* webpackChunkName: "ha-sidebar" */ "../components/ha-sidebar"); // IoB

    this.addEventListener("hass-toggle-menu", () => {
      const shouldOpen = !this.drawer.opened;

      if (shouldOpen) {
        if (this._narrow) {
          this.drawer.open();
        } else {
          fireEvent(this, "hass-dock-sidebar", { dock: true });
        }
      } else {
        this.drawer.close();
        if (this.hass!.dockedSidebar) {
          fireEvent(this, "hass-dock-sidebar", { dock: false });
        }
      }
    });
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    if (changedProps.has("route") && this._narrow) {
      this.drawer.close();
    }

    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;

    // Make app-drawer adjust to a potential LTR/RTL change
    if (oldHass && oldHass.language !== this.hass!.language) {
      this.drawer._resetPosition();
    }
  }

  private _narrowChanged(ev: PolymerChangedEvent<boolean>) {
    this._narrow = ev.detail.value;
  }

  private get drawer(): AppDrawerElement {
    return this.shadowRoot!.querySelector("app-drawer")!;
  }

  static get styles(): CSSResult {
    return css`
      :host {
        color: var(--primary-text-color);
        /* remove the grey tap highlights in iOS on the fullscreen touch targets */
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      }
      partial-panel-resolver,
      ha-sidebar {
        /* allow a light tap highlight on the actual interface elements  */
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
      }
      partial-panel-resolver {
        height: 100%;
      }
    `;
  }
}

customElements.define("home-assistant-main", HomeAssistantMain);
