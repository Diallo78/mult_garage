import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Aperçu fidèle d'un document imprimable.
 *
 * Le rendu est isolé dans une iframe (`srcdoc`) afin que les styles du document
 * n'entrent pas en conflit avec ceux de l'application.
 */
@Component({
  selector: 'app-print-template-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center gap-3 w-full">
      <div
        *ngIf="showToolbar"
        class="flex items-center gap-2 text-sm text-gray-600"
      >
        <span>Zoom</span>
        <button
          type="button"
          class="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
          (click)="setZoom(-0.1)"
        >
          −
        </button>
        <span class="w-14 text-center">{{ zoomPercent }} %</span>
        <button
          type="button"
          class="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
          (click)="setZoom(0.1)"
        >
          +
        </button>
        <button
          type="button"
          class="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
          (click)="resetZoom()"
        >
          100 %
        </button>
      </div>

      <div class="w-full overflow-auto bg-gray-200 rounded-lg p-4 flex justify-center">
        <div
          class="bg-white shadow-lg relative"
          style="flex: 0 0 auto"
          [style.width.px]="pageWidthPx * zoom"
          [style.height.px]="pageHeightPx * zoom"
        >
          <iframe
            #frame
            title="Aperçu du document"
            style="border: 0; position: absolute; top: 0; left: 0; transform-origin: top left;"
            [style.width.px]="pageWidthPx"
            [style.height.px]="pageHeightPx"
            [style.transform]="'scale(' + zoom + ')'"
          ></iframe>
        </div>
      </div>
    </div>
  `,
})
export class PrintTemplatePreviewComponent implements OnChanges, AfterViewInit {
  /** Document HTML complet à afficher. */
  @Input() html = '';
  /** Largeur de la page en pixels CSS. */
  @Input() pageWidthPx = 794;
  /** Hauteur de la page en pixels CSS. */
  @Input() pageHeightPx = 1123;
  /** Affiche la barre de zoom. */
  @Input() showToolbar = true;

  @ViewChild('frame') private frame?: ElementRef<HTMLIFrameElement>;

  /** Facteur de zoom appliqué à l'aperçu. */
  zoom = 1;

  private viewReady = false;

  get zoomPercent(): number {
    return Math.round(this.zoom * 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['html']) {
      this.applyHtml();
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.applyHtml();
  }

  setZoom(delta: number): void {
    this.zoom = Math.min(1.5, Math.max(0.3, Number((this.zoom + delta).toFixed(2))));
  }

  resetZoom(): void {
    this.zoom = 1;
  }

  private applyHtml(): void {
    if (!this.viewReady || !this.frame) return;
    // Affectation directe (hors binding) : évite la sanitisation d'Angular,
    // le contenu provient exclusivement du moteur de rendu local.
    this.frame.nativeElement.srcdoc = this.html;
  }
}
