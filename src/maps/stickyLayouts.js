// Retain viewed boundaries for the lifetime of one map, independently of the
// current selection and the projects returned for the visible viewport.
export class StickyLayouts {
  constructor(createPolygon) {
    this.createPolygon = createPolygon;
    this.entries = new Map();
  }

  remember(projectId, path, color = '#2563eb') {
    if (!projectId || path.length < 3) return;
    const options = { paths: path, strokeColor: color, fillColor: color };
    const existing = this.entries.get(projectId);
    if (existing) existing.setOptions(options);
    else this.entries.set(projectId, this.createPolygon({
      ...options, strokeOpacity: 1, strokeWeight: 2, fillOpacity: 0.18,
      clickable: false, editable: false, draggable: false, zIndex: 4
    }));
  }

  has(projectId) { return this.entries.has(projectId); }

  show(map, visible, selectedProjectId) {
    for (const [id, polygon] of this.entries) {
      // The selected boundary has its own overlay, including editing handles.
      polygon.setMap(visible && id !== selectedProjectId ? map : null);
    }
  }

  clear() {
    for (const polygon of this.entries.values()) polygon.setMap(null);
    this.entries.clear();
  }
}
