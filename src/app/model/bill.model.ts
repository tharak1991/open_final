export class Bill {
    subtotal: number;
    gst: number;
    misc: number;
    final: number;

    constructor(st: number, gst: number, misc: number, final: number) {
      this.subtotal = st;
      this.gst = gst;
      this.misc = misc;
      this.final = final;
    }
}
