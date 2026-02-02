// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React, { CSSProperties, useContext, useRef } from 'react';
import { ModelContext } from './contexts.ts';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import ExportButton from './ExportButton.tsx';
import SettingsMenu from './SettingsMenu.tsx';
import MultimaterialColorsDialog from './MultimaterialColorsDialog.tsx';


export default function Footer({style}: {style?: CSSProperties}) {
  const model = useContext(ModelContext);
  if (!model) throw new Error('No model');
  const state = model.state;
  
  const toast = useRef<Toast>(null);

  const severityByMarkerSeverity = new Map<monaco.MarkerSeverity, 'danger' | 'warning' | 'info'>([
    [monaco.MarkerSeverity.Error, 'danger'],
    [monaco.MarkerSeverity.Warning, 'warning'],
    [monaco.MarkerSeverity.Info, 'info'],
  ]);
  const markers = state.lastCheckerRun?.markers ?? [];
  const getBadge = (s: monaco.MarkerSeverity) => {
    const count = markers.filter(m => m.severity == s).length;
    const sev = s == monaco.MarkerSeverity.Error ? 'danger'
      : s == monaco.MarkerSeverity.Warning ? 'warning'
      : s == monaco.MarkerSeverity.Info ? 'info'
      : 'success';
    return <>{count > 0 && <Badge value={count} severity={severityByMarkerSeverity.get(s)}></Badge>}</>;
  };


  const maxMarkerSeverity = markers.length == 0 ? undefined : markers.map(m => m.severity).reduce((a, b) => Math.max(a, b));
  
  return <>
    <ProgressBar mode="indeterminate"
                style={{
                  marginLeft: '5px',
                  marginRight: '5px',
                    visibility: state.rendering || state.previewing || state.checkingSyntax || state.exporting
                      ? 'visible' : 'hidden',
                    height: '6px' }}></ProgressBar>
      
    <div className="flex flex-row gap-1" style={{
        alignItems: 'center',
        margin: '5px',
        ...(style ?? {})
    }}>
      {/* Import Button - Always visible */}
      <Button
        icon="pi pi-upload"
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.stl,.obj,.off,.3mf,.glb,.gltf';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = async (event) => {
                const content = event.target?.result;
                if (content) {
                  try {
                    const path = `/${file.name}`;
                    model.fs.writeFileSync(path, new Uint8Array(content as ArrayBuffer));
                    model.openFile(path);
                    toast.current?.show({severity: 'success', summary: 'Imported', detail: `${file.name} imported successfully`});
                  } catch (error) {
                    toast.current?.show({severity: 'error', summary: 'Import Failed', detail: `${error}`});
                  }
                }
              };
              reader.readAsArrayBuffer(file);
            }
          };
          input.click();
        }}
        className="p-button-sm p-button-secondary"
        label="Import"
        tooltip="Import 3D model (STL, OBJ, OFF, 3MF, GLB)"
        tooltipOptions={{ position: 'top' }}
      />

      {/* Export Button - Always visible */}
      <ExportButton />

      {state.previewing ? (
          <Button
            icon="pi pi-bolt"
            disabled
            className="p-button-sm"
            label="Previewing..."
            />
        ) : state.output && state.output.isPreview ? (
            <Button
              icon="pi pi-bolt"
              onClick={() => model.render({isPreview: false, now: true})}
              className="p-button-sm"
              disabled={state.rendering}
              label={state.rendering ? 'Rendering...' : 'Render'}
              />
        ) : undefined
      }
      <MultimaterialColorsDialog />
      {/* <Button
        icon="pi pi-bolt"
        onClick={() => model.render({isPreview: false, now: true})}
        className="p-button-sm"
        label="Render"
        />

      <ExportButton /> */}
      
      {(state.lastCheckerRun || state.output) &&
        <Button type="button"
            severity={maxMarkerSeverity && severityByMarkerSeverity.get(maxMarkerSeverity)}
            icon="pi pi-align-left"
            text={!state.view.logs}
            onClick={() => model.logsVisible = !state.view.logs}
            className={maxMarkerSeverity && `p-button-${severityByMarkerSeverity.get(maxMarkerSeverity) ?? 'success'}`}
            >
          {getBadge(monaco.MarkerSeverity.Error)}
          {getBadge(monaco.MarkerSeverity.Warning)}
          {getBadge(monaco.MarkerSeverity.Info)}
        </Button>}

      <div style={{flex: 1}}></div>

      <SettingsMenu />

      <Toast ref={toast} />
    </div>
  </>
}
