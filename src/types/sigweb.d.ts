declare namespace Topaz {
    namespace Global {
    function Connect(): Promise<number>;
    function Disconnect(): void;
    function GetDeviceStatus(): Promise<number>; // 0 = offline, 2 = online
  }
  namespace Canvas {
    namespace Sign {
      function SetTabletState(state: number): Promise<void>;
      function StartSign(canvas: HTMLCanvasElement): Promise<void>;
      function StopSign(): void;
      function GetSignatureImage(): Promise<string>;
      function ClearSign(): void;
    }
  }

  namespace GemView {
    function PushCurrentTab(): Promise<void>;
    function RevertCurrentTab(target: number): Promise<void>;
    function StartCaptureGemViewScreen(
      render: (imageBase64: string, error?: string) => void,
      delay?: number,
      enableRequestAnimationFrame?: boolean
    ): void;
    function StopCaptureGemViewScreen(): void;
    function OpenIdleScreen(duration: number, displayLogo: boolean, displayType: number): void;
    function CloseIdleScreen(): void;
  }

  namespace SignatureCaptureWindow {
    namespace CustomWindow {
      function SetSigningWindowState(state: number): void;
      function SetSigningWindowSize(width: number, height: number): void;
      function SetSigningWindowLocation(x: number, y: number): void;
      function SetSigningAreaSize(width: number, height: number): void;
      function SetSigningAreaDock(dock: number): void;
      function Save(): void;
    }

    namespace Sign {
      function StartSign(showInNewWindow: boolean): Promise<void>;
      function GetSignatureImage(): Promise<string>;
      function IsSigned(): Promise<boolean>;
      function SignComplete(): Promise<void>;
      function StopSign(): void;
    }
  }
}
