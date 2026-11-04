import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GarageDataService } from './garage-data.service';
import { GarageDtoFunction } from './fonction/garageDto-function';
import { Garage } from '../models/user.model';
import {
  PrintBodySection,
  PrintDocumentType,
  PrintPageFormat,
  PrintTemplateData,
  getDocumentTypeInfo,
} from '../models/print-template.model';

/** 1 millimètre exprimé en pixels CSS (96 dpi). */
const MM_TO_PX = 96 / 25.4;
/** Couleur de fond des lignes alternées du tableau. */
const ZEBRA_COLOR = '#f3f4f6';

/** Une ligne du tableau des prestations / pièces. */
export interface PrintLineItem {
  designation: string;
  quantity: string | number;
  unitPrice: string | number;
  total: string | number;
}

/** Une ligne de total (sous-total, TVA, total à payer...). */
export interface PrintTotalLine {
  label: string;
  value: string;
  strong?: boolean;
}

/** Une information complémentaire (numéro, date, kilométrage...). */
export interface PrintMetaLine {
  label: string;
  value: string;
}

/** Une ligne d'un tableau libre. */
export interface PrintTableRow {
  cells: (string | number)[];
  /** Libellé de regroupement affiché au-dessus de la ligne (ex : catégorie). */
  groupLabel?: string;
}

/** Un tableau libre à colonnes configurables (ex : points de contrôle). */
export interface PrintTableBlock {
  title?: string;
  head: string[];
  rows: PrintTableRow[];
  /** Index des colonnes alignées au centre ; les autres sont alignées à gauche. */
  centerColumns?: number[];
}

/** Données métier à imprimer. Elles proviennent des collections existantes. */
export interface PrintDocumentData {
  documentType: PrintDocumentType;
  /** Titre imprimé (sinon le titre par défaut du type de document). */
  title?: string;
  documentNumber?: string;
  documentDate?: string;
  meta?: PrintMetaLine[];
  clientName?: string;
  clientLines?: string[];
  vehicleLines?: string[];
  items?: PrintLineItem[];
  itemsHead?: string[];
  /** Tableaux libres supplémentaires (points de contrôle, pièces jointes...). */
  tables?: PrintTableBlock[];
  totals?: PrintTotalLine[];
  notes?: string;
  currency?: string;
}

/** Informations d'identité de l'entreprise utilisées dans l'en-tête / le pied. */
export interface PrintGarageInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  signature?: string;
  nif?: string;
  rc?: string;
  agrement?: string;
  capitalSocial?: number;
  currency?: string;
}

/**
 * Transforme un modèle d'impression + des données métier en document imprimable.
 *
 * Ce service ne connaît aucune logique métier : il ne fait que mettre en forme
 * des données qui lui sont fournies par les écrans existants.
 */
@Injectable({
  providedIn: 'root',
})
export class PrintRendererService {
  constructor(private readonly garageDataService: GarageDataService) {}

  // ---------------------------------------------------------------------------
  // Dimensions
  // ---------------------------------------------------------------------------

  /** Dimensions de la page en millimètres. */
  getPageSizeMm(template: PrintTemplateData): {
    width: number;
    height: number;
  } {
    const formats: Record<PrintPageFormat, { width: number; height: number }> = {
      A4: { width: 210, height: 297 },
      A5: { width: 148, height: 210 },
      Letter: { width: 215.9, height: 279.4 },
    };
    const base = formats[template.pageSettings.format] ?? formats.A4;

    return template.pageSettings.orientation === 'landscape'
      ? { width: base.height, height: base.width }
      : base;
  }

  /** Largeur de la page en pixels CSS (pour l'aperçu). */
  getPageWidthPx(template: PrintTemplateData): number {
    return Math.round(this.getPageSizeMm(template).width * MM_TO_PX);
  }

  /** Hauteur de la page en pixels CSS (pour l'aperçu). */
  getPageHeightPx(template: PrintTemplateData): number {
    return Math.round(this.getPageSizeMm(template).height * MM_TO_PX);
  }

  // ---------------------------------------------------------------------------
  // Informations garage
  // ---------------------------------------------------------------------------

  /** Récupère les informations du garage depuis le localStorage (repli). */
  getGarageInfoFromStorage(): PrintGarageInfo | null {
    const dto = GarageDtoFunction.garageDto();
    if (!dto) return null;
    return {
      name: dto.name ?? '',
      address: dto.address ?? '',
      phone: dto.phone ?? '',
      email: dto.email ?? '',
      website: dto.website,
      logo: dto.logo,
      signature: dto.signature,
      nif: dto.nif,
      rc: dto.rc,
      agrement: dto.agrement,
      capitalSocial: dto.capitalSocial,
      currency: dto.currency,
    };
  }

  /**
   * Récupère les informations du garage depuis Firestore, avec repli sur le
   * localStorage si la lecture échoue.
   */
  async loadGarageInfo(): Promise<PrintGarageInfo | null> {
    const garageId = localStorage.getItem('garageId');
    if (!garageId) return this.getGarageInfoFromStorage();

    try {
      const garage = await this.garageDataService.getById<Garage>(
        'garages',
        garageId
      );
      if (!garage) return this.getGarageInfoFromStorage();

      return {
        name: garage.name ?? '',
        address: garage.address ?? '',
        phone: garage.phone ?? '',
        email: garage.email ?? '',
        website: garage.website,
        logo: garage.logo,
        signature: garage.signature,
        nif: garage.nif,
        rc: garage.rc,
        agrement: garage.agrement,
        capitalSocial: garage.capitalSocial,
        // La devise peut être stockée à la racine (formulaire de paramétrage)
        // ou dans `settings` (création du garage) : on prend la valeur la plus
        // récente, sinon celle de `settings`.
        currency: garage.currency ?? garage.settings?.currency,
      };
    } catch {
      return this.getGarageInfoFromStorage();
    }
  }

  // ---------------------------------------------------------------------------
  // Génération HTML
  // ---------------------------------------------------------------------------

  /** Document HTML complet, prêt à être imprimé ou affiché dans une iframe. */
  buildFullHtml(
    template: PrintTemplateData,
    data: PrintDocumentData,
    garage: PrintGarageInfo | null,
    autoPrint = false
  ): string {
    const page = this.getPageSizeMm(template);
    const orientation = template.pageSettings.orientation;

    const printScript = autoPrint
      ? `<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};<\/script>`
      : '';

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${this.escape(data.title || getDocumentTypeInfo(data.documentType)?.defaultTitle || 'Document')}</title>
<style>
  /* Par défaut, les navigateurs suppriment les fonds à l'impression.
     On force la restitution des couleurs pour l'en-tête du tableau
     (fond + texte) et les bordures colorées. */
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  html, body { margin: 0; padding: 0; background: #ffffff; }
  @page { size: ${page.width}mm ${page.height}mm; margin: 0; }
  table { border-collapse: collapse; }
  th, td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head>
<body>
${this.buildBodyHtml(template, data, garage)}
${printScript}
</body>
</html>`;
  }

  /** Contenu du document (styles en ligne) : utilisé pour l'aperçu et le PDF. */
  buildBodyHtml(
    template: PrintTemplateData,
    data: PrintDocumentData,
    garage: PrintGarageInfo | null
  ): string {
    const page = this.getPageSizeMm(template);
    const { marginTop, marginRight, marginBottom, marginLeft } =
      template.pageSettings;
    const style = template.styleSettings;

    const pageStyle = [
      `width:${page.width}mm`,
      `min-height:${page.height}mm`,
      `padding:${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`,
      `font-family:${style.fontFamily}`,
      `font-size:${style.baseFontSize}px`,
      `color:${style.textColor}`,
      'background:#ffffff',
      'position:relative',
    ].join(';');

    return `<div class="cg-page" style="${pageStyle}">
${this.renderHeader(template, data, garage)}
${this.renderBody(template, data)}
${this.renderSignatures(template, garage)}
${this.renderFooter(template, garage)}
</div>`;
  }

  // ---------------------------------------------------------------------------
  // Sections
  // ---------------------------------------------------------------------------

  private renderHeader(
    template: PrintTemplateData,
    data: PrintDocumentData,
    garage: PrintGarageInfo | null
  ): string {
    const header = template.headerSettings;
    const style = template.styleSettings;
    const info = this.renderCompanyInfo(header, style, garage);

    const logo =
      header.logoVisible && garage?.logo
        ? `<img src="${garage.logo}" alt="Logo" style="width:${header.logoWidth}mm;height:${header.logoHeight}mm;object-fit:contain;" />`
        : '';

    const logoFirst = header.logoAlign !== 'right';
    const blocks = logoFirst ? `${logo}${info}` : `${info}${logo}`;

    const borderStyle = header.borderBottom
      ? `border-bottom:2px solid ${header.borderColor};padding-bottom:4mm;`
      : 'padding-bottom:4mm;';

    const title = this.escape(
      data.title ||
        getDocumentTypeInfo(data.documentType)?.defaultTitle ||
        'DOCUMENT'
    );

    return `<header style="display:flex;align-items:flex-start;gap:6mm;${borderStyle}">
  <div style="flex:1;display:flex;align-items:flex-start;justify-content:space-between;gap:6mm;">
    ${blocks}
  </div>
</header>
<div style="text-align:${header.titleAlign};margin:6mm 0 4mm;">
  <span style="font-size:${style.baseFontSize + 7}px;font-weight:700;color:${style.titleColor};letter-spacing:1px;">${title}</span>
  ${
    template.styleSettings.showSeparators
      ? `<div style="margin-top:2mm;border-top:1px solid ${style.primaryColor};"></div>`
      : ''
  }
</div>`;
  }

  private renderCompanyInfo(
    header: PrintTemplateData['headerSettings'],
    style: PrintTemplateData['styleSettings'],
    garage: PrintGarageInfo | null
  ): string {
    const lines: string[] = [];
    if (header.showCompanyName && garage?.name) {
      lines.push(
        `<div style="font-size:${style.baseFontSize + 2}px;font-weight:700;color:${style.primaryColor};">${this.escape(garage.name)}</div>`
      );
    }
    if (header.showAddress && garage?.address) {
      lines.push(this.escape(garage.address).replace(/\n/g, '<br/>'));
    }
    if (header.showPhone && garage?.phone) {
      lines.push(`Tél. : ${this.escape(garage.phone)}`);
    }
    if (header.showEmail && garage?.email) {
      lines.push(`E-mail : ${this.escape(garage.email)}`);
    }
    if (header.showWebsite && garage?.website) {
      lines.push(this.escape(garage.website));
    }
    if (header.showLegalIds) {
      const legal: string[] = [];
      if (garage?.nif) legal.push(`NIF : ${this.escape(garage.nif)}`);
      if (garage?.rc) legal.push(`RC : ${this.escape(garage.rc)}`);
      if (garage?.agrement) legal.push(`Agrément : ${this.escape(garage.agrement)}`);
      if (legal.length) lines.push(legal.join(' - '));
    }

    return `<div style="text-align:${header.align};font-size:${style.baseFontSize - 1}px;line-height:1.6;color:${style.textColor};">
${lines.join('<br/>')}
</div>`;
  }

  private renderBody(
    template: PrintTemplateData,
    data: PrintDocumentData
  ): string {
    const body = template.bodySettings;
    const infoSections: PrintBodySection[] = [
      'documentInfo',
      'clientInfo',
      'vehicleInfo',
    ];

    const blocks: string[] = [];
    let infoBuffer: string[] = [];

    const flushInfo = () => {
      if (!infoBuffer.length) return;
      blocks.push(
        `<div style="display:flex;gap:4mm;flex-wrap:wrap;margin-bottom:${body.sectionSpacing}mm;">${infoBuffer.join('')}</div>`
      );
      infoBuffer = [];
    };

    body.sectionOrder.forEach((section) => {
      if (infoSections.includes(section)) {
        const box = this.renderInfoBox(section, template, data);
        if (box) infoBuffer.push(box);
        return;
      }
      flushInfo();
      const block = this.renderBlock(section, template, data);
      if (block) blocks.push(block);
    });
    flushInfo();

    return `<main>${blocks.join('\n')}</main>`;
  }

  private renderInfoBox(
    section: PrintBodySection,
    template: PrintTemplateData,
    data: PrintDocumentData
  ): string {
    const body = template.bodySettings;
    const style = template.styleSettings;

    if (section === 'documentInfo' && body.showDocumentInfo) {
      const lines: string[] = [];
      if (data.documentNumber) lines.push(`N° : ${this.escape(data.documentNumber)}`);
      if (data.documentDate) lines.push(`Date : ${this.escape(data.documentDate)}`);
      (data.meta ?? []).forEach((meta) =>
        lines.push(`${this.escape(meta.label)} : ${this.escape(meta.value)}`)
      );
      if (!lines.length) return '';
      return this.infoBoxHtml('Document', lines.join('<br/>'), style);
    }

    if (section === 'clientInfo' && body.showClientInfo) {
      const lines = data.clientLines ?? [];
      if (!data.clientName && !lines.length) return '';
      const content = [
        data.clientName
          ? `<strong>${this.escape(data.clientName)}</strong>`
          : '',
        ...lines.map((line) => this.escape(line)),
      ]
        .filter(Boolean)
        .join('<br/>');
      return this.infoBoxHtml('Client', content, style);
    }

    if (section === 'vehicleInfo' && body.showVehicleInfo) {
      const lines = data.vehicleLines ?? [];
      if (!lines.length) return '';
      return this.infoBoxHtml(
        'Véhicule',
        lines.map((line) => this.escape(line)).join('<br/>'),
        style
      );
    }

    return '';
  }

  private infoBoxHtml(
    title: string,
    content: string,
    style: PrintTemplateData['styleSettings']
  ): string {
    return `<div style="flex:1 1 30%;min-width:30%;border:1px solid #e5e7eb;border-radius:3px;padding:3mm;">
  <div style="font-size:${style.baseFontSize - 2}px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-bottom:1.5mm;">${this.escape(title)}</div>
  <div style="line-height:1.5;">${content}</div>
</div>`;
  }

  private renderBlock(
    section: PrintBodySection,
    template: PrintTemplateData,
    data: PrintDocumentData
  ): string {
    switch (section) {
      case 'itemsTable':
        return template.bodySettings.showItems
          ? this.renderItemsSection(template, data)
          : '';
      case 'totals':
        return template.bodySettings.showTotals
          ? this.renderTotals(template, data)
          : '';
      case 'notes':
        return template.bodySettings.showNotes && data.notes
          ? this.blockHtml('Observations', this.escape(data.notes).replace(/\n/g, '<br/>'), template)
          : '';
      case 'conditions':
        return template.bodySettings.showConditions &&
          template.bodySettings.conditionsText
          ? this.blockHtml(
              'Conditions générales',
              this.escape(template.bodySettings.conditionsText).replace(/\n/g, '<br/>'),
              template
            )
          : '';
      default:
        return '';
    }
  }

  private blockHtml(
    title: string,
    content: string,
    template: PrintTemplateData
  ): string {
    const style = template.styleSettings;
    return `<section style="margin-bottom:${template.bodySettings.sectionSpacing}mm;">
  <div style="font-size:${style.baseFontSize - 1}px;font-weight:700;color:${style.secondaryColor};margin-bottom:1.5mm;">${this.escape(title)}</div>
  <div style="font-size:${style.baseFontSize - 1}px;line-height:1.5;">${content}</div>
</section>`;
  }

  /**
   * Contenu de la section « tableau » : tableau des prestations (le cas
   * échéant) puis tableaux libres éventuels (points de contrôle...).
   */
  private renderItemsSection(
    template: PrintTemplateData,
    data: PrintDocumentData
  ): string {
    const parts: string[] = [];
    if (data.items?.length) parts.push(this.renderItemsTable(template, data));
    (data.tables ?? []).forEach((table) => {
      if (table.rows?.length) parts.push(this.renderTableBlock(template, table));
    });
    return parts.join('\n');
  }

  /** Tableau libre à colonnes configurables, avec regroupements optionnels. */
  private renderTableBlock(
    template: PrintTemplateData,
    table: PrintTableBlock
  ): string {
    const body = template.bodySettings;
    const style = template.styleSettings;
    const columnCount = table.head.length;
    const alignments = table.head.map((_, index) =>
      table.centerColumns?.includes(index) ? 'center' : 'left'
    );

    const headCells = table.head
      .map(
        (label, index) =>
          `<th style="padding:2mm;border:1px solid ${body.tableBorderColor};text-align:${alignments[index]};font-size:${body.fontSize}px;">${this.escape(label)}</th>`
      )
      .join('');

    const rows = table.rows
      .map((row, index) => {
        const parts: string[] = [];
        if (row.groupLabel) {
          parts.push(
            `<tr style="background:${body.tableHeadColor};color:${body.tableHeadTextColor};">
  <td colspan="${columnCount}" style="padding:2mm;border:1px solid ${body.tableBorderColor};font-weight:700;font-size:${body.fontSize}px;">${this.escape(row.groupLabel)}</td>
</tr>`
          );
        }
        const background =
          body.tableZebra && index % 2 === 1 ? `background:${ZEBRA_COLOR};` : '';
        const cells = row.cells
          .map(
            (value, cellIndex) =>
              `<td style="padding:2mm;border:1px solid ${body.tableBorderColor};text-align:${alignments[cellIndex] ?? 'left'};font-size:${body.fontSize}px;vertical-align:top;">${this.formatCell(value)}</td>`
          )
          .join('');
        parts.push(`<tr style="${background}">${cells}</tr>`);
        return parts.join('');
      })
      .join('');

    const title = table.title
      ? `<div style="font-size:${style.baseFontSize - 1}px;font-weight:700;color:${style.secondaryColor};margin-bottom:1.5mm;">${this.escape(table.title)}</div>`
      : '';

    return `<section style="margin-bottom:${body.sectionSpacing}mm;">
  ${title}
  <table style="width:100%;">
    <thead>
      <tr style="background:${body.tableHeadColor};color:${body.tableHeadTextColor};">${headCells}</tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;
  }

  private renderItemsTable(
    template: PrintTemplateData,
    data: PrintDocumentData
  ): string {
    const body = template.bodySettings;
    const currency = data.currency ? ` (${this.escape(data.currency)})` : '';
    const head = data.itemsHead ?? [
      'Désignation',
      'Quantité',
      `Prix unitaire${currency}`,
      `Total${currency}`,
    ];
    const alignments = ['left', 'center', 'right', 'right'];

    const headCells = head
      .map(
        (label, index) =>
          `<th style="padding:2mm;border:1px solid ${body.tableBorderColor};text-align:${alignments[index] ?? 'left'};font-size:${body.fontSize}px;">${this.escape(label)}</th>`
      )
      .join('');

    const rows = (data.items ?? [])
      .map((item, index) => {
        const background =
          body.tableZebra && index % 2 === 1
            ? `background:${ZEBRA_COLOR};`
            : '';
        const cells = [
          this.escape(item.designation),
          this.escape(String(item.quantity)),
          this.formatCell(item.unitPrice, data.currency),
          this.formatCell(item.total, data.currency),
        ]
          .map(
            (value, cellIndex) =>
              `<td style="padding:2mm;border:1px solid ${body.tableBorderColor};text-align:${alignments[cellIndex] ?? 'left'};font-size:${body.fontSize}px;">${
                cellIndex === 3 ? `<strong>${value}</strong>` : value
              }</td>`
          )
          .join('');
        return `<tr style="${background}">${cells}</tr>`;
      })
      .join('');

    return `<section style="margin-bottom:${body.sectionSpacing}mm;">
  <table style="width:100%;">
    <thead>
      <tr style="background:${body.tableHeadColor};color:${body.tableHeadTextColor};">${headCells}</tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;
  }

  private renderTotals(
    template: PrintTemplateData,
    data: PrintDocumentData
  ): string {
    const totals = data.totals ?? [];
    if (!totals.length) return '';
    const style = template.styleSettings;

    const rows = totals
      .map(
        (line) => `<tr>
  <td style="padding:1.5mm 3mm;text-align:right;color:#4b5563;">${this.escape(line.label)}</td>
  <td style="padding:1.5mm 3mm;text-align:right;font-weight:${line.strong ? '700' : '400'};${line.strong ? `color:${style.primaryColor};font-size:${style.baseFontSize + 2}px;` : ''}">${this.escape(line.value)}</td>
</tr>`
      )
      .join('');

    return `<section style="display:flex;justify-content:flex-end;margin-bottom:${template.bodySettings.sectionSpacing}mm;">
  <table style="min-width:70mm;">${rows}</table>
</section>`;
  }

  private renderSignatures(
    template: PrintTemplateData,
    garage: PrintGarageInfo | null
  ): string {
    const signature = template.signatureSettings;
    const zones = [
      signature.responsible,
      signature.client,
      signature.mechanic,
      signature.stamp,
    ].filter((zone) => zone.enabled);

    if (!zones.length) return '';

    const cells = zones
      .map((zone, index) => {
        const isResponsible = zone === signature.responsible;
        const image =
          isResponsible && garage?.signature
            ? `<img src="${garage.signature}" alt="Signature" style="max-height:14mm;object-fit:contain;" />`
            : '';
        return `<div style="flex:1;text-align:center;">
  <div style="font-size:${template.styleSettings.baseFontSize - 1}px;color:#4b5563;margin-bottom:2mm;">${this.escape(zone.label)}</div>
  <div style="height:18mm;display:flex;align-items:center;justify-content:center;">${image}</div>
  <div style="border-top:1px solid #9ca3af;margin:0 ${index === 0 ? '0' : '2mm'};"></div>
</div>`;
      })
      .join('');

    return `<section style="display:flex;gap:6mm;margin-top:8mm;">${cells}</section>`;
  }

  private renderFooter(
    template: PrintTemplateData,
    garage: PrintGarageInfo | null
  ): string {
    const footer = template.footerSettings;
    if (!footer.visible) return '';

    const style = template.styleSettings;
    const lines: string[] = [];

    if (footer.text) lines.push(this.escape(footer.text));
    if (footer.slogan) lines.push(`<em>${this.escape(footer.slogan)}</em>`);
    if (footer.showCompanyContacts && garage) {
      const contacts = [garage.phone, garage.email, garage.website]
        .filter(Boolean)
        .map((value) => this.escape(String(value)))
        .join(' - ');
      if (contacts) lines.push(contacts);
    }
    if (footer.showLegalMentions && garage) {
      const legal: string[] = [];
      if (garage.name) legal.push(this.escape(garage.name));
      if (garage.address) legal.push(this.escape(garage.address));
      if (garage.rc) legal.push(`RC : ${this.escape(garage.rc)}`);
      if (garage.nif) legal.push(`NIF : ${this.escape(garage.nif)}`);
      if (garage.capitalSocial !== undefined) {
        legal.push(`Capital : ${garage.capitalSocial.toLocaleString('fr-FR')}`);
      }
      if (legal.length) lines.push(legal.join(' - '));
    }
    if (footer.showBankDetails) {
      const bank: string[] = [];
      if (footer.bankName) bank.push(this.escape(footer.bankName));
      if (footer.bankAccount) bank.push(`Compte : ${this.escape(footer.bankAccount)}`);
      if (footer.bankIban) bank.push(`IBAN : ${this.escape(footer.bankIban)}`);
      if (footer.bankSwift) bank.push(`SWIFT : ${this.escape(footer.bankSwift)}`);
      if (bank.length) lines.push(bank.join(' - '));
    }

    if (!lines.length) return '';

    const borderStyle = footer.borderTop
      ? `border-top:1px solid ${footer.borderColor};`
      : '';

    return `<footer style="${borderStyle}margin-top:6mm;padding-top:2mm;text-align:${footer.align};font-size:${style.baseFontSize - 2}px;color:#6b7280;line-height:1.5;">
${lines.join('<br/>')}
</footer>`;
  }

  // ---------------------------------------------------------------------------
  // Impression / export
  // ---------------------------------------------------------------------------

  /** Ouvre une fenêtre d'impression avec le document mis en forme. */
  print(
    template: PrintTemplateData,
    data: PrintDocumentData,
    garage: PrintGarageInfo | null
  ): void {
    const html = this.buildFullHtml(template, data, garage, true);
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      throw new Error(
        "La fenêtre d'impression a été bloquée. Autorisez les fenêtres pop-up pour ce site."
      );
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  /** Génère un PDF téléchargeable à partir du document mis en forme. */
  async exportPdf(
    template: PrintTemplateData,
    data: PrintDocumentData,
    garage: PrintGarageInfo | null,
    fileName: string
  ): Promise<void> {
    const page = this.getPageSizeMm(template);
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-20000px';
    container.style.top = '0';
    container.style.width = `${page.width}mm`;
    container.style.background = '#ffffff';
    container.innerHTML = this.buildBodyHtml(template, data, garage);
    document.body.appendChild(container);

    try {
      const target = container.firstElementChild as HTMLElement;
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const pdf = new jsPDF({
        orientation: template.pageSettings.orientation,
        unit: 'mm',
        format: [page.width, page.height],
      });

      const imageWidth = page.width;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const imageData = canvas.toDataURL('image/jpeg', 0.95);

      let heightLeft = imageHeight;
      let position = 0;
      pdf.addImage(imageData, 'JPEG', 0, position, imageWidth, imageHeight);
      heightLeft -= page.height;

      while (heightLeft > 0) {
        position -= page.height;
        pdf.addPage([page.width, page.height], template.pageSettings.orientation);
        pdf.addImage(imageData, 'JPEG', 0, position, imageWidth, imageHeight);
        heightLeft -= page.height;
      }

      pdf.save(fileName);
    } finally {
      document.body.removeChild(container);
    }
  }

  // ---------------------------------------------------------------------------
  // Utilitaires
  // ---------------------------------------------------------------------------

  private formatCell(
    value: string | number | undefined,
    currency?: string
  ): string {
    if (value === undefined || value === null || value === '') return '-';
    if (typeof value === 'number') {
      const formatted = value.toLocaleString('fr-FR');
      return currency ? `${formatted} ${this.escape(currency)}` : formatted;
    }
    // Les sauts de ligne d'une cellule deviennent des retours à la ligne HTML.
    return this.escape(value).replace(/\n/g, '<br/>');
  }

  private escape(value: unknown): string {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
