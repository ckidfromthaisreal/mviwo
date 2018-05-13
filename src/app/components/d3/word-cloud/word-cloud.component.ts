import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import * as d3Selection from 'd3-selection';
import * as d3Cloud from 'd3-cloud';

export interface WordCloudData {
  text: String;
  size: Number;
}

export interface WordCloudOptions {
  size?: {
    width: number;
    height: number;
  };
  padding?: number;
  font?: {
    family?: string;
    weight?: string;
    style?: string;
    size?: {
      min: number;
      max: number;
      func: "sqrt" | "linear" | ((size: number) => number);
    };
  },
  rotate?: () => number;
  useTooltip?: boolean;
}

@Component({
  selector: 'mviwo-word-cloud',
  templateUrl: './word-cloud.component.html',
  styleUrls: ['./word-cloud.component.scss']
})
export class WordCloudComponent implements OnInit, AfterViewInit {
  @Input() data: WordCloudData[] | Array<WordCloudData> = [];
  @Input() options: WordCloudOptions = {
    size: {
      width: 700, height: 500
    },
    padding: 0,
    font: {
      family: 'Impact',
      weight: 'normal',
      style: 'normal',
      size: {
        min: 10,
        max: 60,
        func: 'linear'
      }
    },
    rotate: () => {
      return ~~Math.random() * 2 
    },
    useTooltip: true
  };

  words: any;

  colored = {};

  // tip: any;

  currentWord: any;
  currentHover: any;

  constructor() { 
  }
  
  ngAfterViewInit() {
  }
  
  ngOnInit() {
    this.layout();
  }

  redraw(recolor: boolean = false): void {
    if (recolor) {
      this.colored = {};
    }

    this.layout();
  }

  private layout() {
    const that = this;

    const layout = d3Cloud().size([this.options.size.width, 
      this.options.size.height])
    .words(this.data)
    .padding(this.options.padding)
    .rotate(() => { return Math.pow(-1, ~~(Math.random() * 2)) * ~~(Math.random() * 3) * 20; }) // TODO
    .font(this.options.font.family)
    .fontSize(function(d) {
      let size = d.size;

      if (that.options.font.size.func === 'sqrt') {
        size = Math.sqrt(d.size);
      } else if (that.options.font.size.func !== 'linear') {
        size = that.options.font.size.func(d.size);
      }

      return Math.min(
        that.options.font.size.max,
        Math.max(that.options.font.size.min, size)
      );
    })
    .fontStyle(this.options.font.style)
    .fontWeight(this.options.font.weight)
    .on("end", d => {
      this.words = d.sort((a,b) => b.size - a.size);
      // console.log(this.words);
    });

    layout.start();

    // this.tip = d3Tip().attr('class', 'd3-tip')
    //   .html(function(d) { return `<span>${d}</span>`; })
    //   .offset([-12, 0]);

    // d3Selection.select('#graph').call(this.tip);
  }

  getRandomColor(word): string {
    if (this.currentHover && this.currentHover.target.innerHTML.trim() === word.text) {
      return 'rgb(255,255,255)';
    }

    if (typeof this.colored[word.text] === 'undefined') {
      this.colored[word.text] = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`;
    }

    return this.colored[word.text];
  }

  onWordClick(word) {
    console.log(word);
  }

  onWordMouseEnter(word, event) {
    // console.log(word);
    console.log(event);
    // this.tip.show();
    this.currentWord = word;
    this.currentHover = event;
  }

  onWordMouseLeave() {
    // console.log('exited');
    this.currentWord = undefined;
    this.currentHover = undefined;
  }

  // showTooltip(): boolean {
    // return this.currentHover && typeof this.currentHover !== 'undefined';
  // }

  repositionTooltip(): any {
    if (this.currentHover) {
      return {
        'top': 
          this.currentHover.offsetY
          // - document.getElementById('cloud-tooltip').firstElementChild.clientHeight
           + 'px',
        'left': this.currentHover.offsetX
            - document.getElementById('cloud-tooltip').firstElementChild.clientWidth / 4
            + 'px',
        'opacity': 1,
        'pointer-events': 'all'
      }
    }

    return {
      'opacity': 0,
      'pointer-events': 'none'
    };
  }
}
