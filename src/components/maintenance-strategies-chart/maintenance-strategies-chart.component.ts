import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
// FIX: Use named imports for d3 functions and types to resolve compilation errors and improve type safety.
import { select, scaleLinear, range, lineRadial, curveLinearClosed, Selection, BaseType } from 'd3';

@Component({
  selector: 'app-maintenance-strategies-chart',
  templateUrl: './maintenance-strategies-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceStrategiesChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') private chartContainer!: ElementRef;
  private resizeObserver: ResizeObserver | null = null;

  private data = [
      { name: 'Corretiva', color: '#ef4444', axes: [
          { axis: 'Custo Inicial', value: 10 },
          { axis: 'Custo a Longo Prazo', value: 10 },
          { axis: 'Proatividade', value: 1 },
          { axis: 'Prevenção de Falhas', value: 1 },
          { axis: 'Complexidade Técnica', value: 2 },
          { axis: 'Impacto na Operação', value: 10 }
      ]},
      { name: 'Preventiva', color: '#facc15', axes: [
          { axis: 'Custo Inicial', value: 4 },
          { axis: 'Custo a Longo Prazo', value: 4 },
          { axis: 'Proatividade', value: 7 },
          { axis: 'Prevenção de Falhas', value: 8 },
          { axis: 'Complexidade Técnica', value: 6 },
          { axis: 'Impacto na Operação', value: 3 }
      ]},
      { name: 'Preditiva', color: '#0c4a6e', axes: [
          { axis: 'Custo Inicial', value: 1 },
          { axis: 'Custo a Longo Prazo', value: 2 },
          { axis: 'Proatividade', value: 10 },
          { axis: 'Prevenção de Falhas', value: 10 },
          { axis: 'Complexidade Técnica', value: 9 },
          { axis: 'Impacto na Operação', value: 1 }
      ]}
  ];
  
  // The data is plotted directly as per the reference image. No inversion is needed.
  private invertedData = this.data;


  ngAfterViewInit(): void {
    if (this.chartContainer) {
      this.resizeObserver = new ResizeObserver(() => this.createChart());
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    
    // Clear previous chart and check dimensions
    // FIX: Use named import 'select' instead of 'd3.select'.
    select(element).select('svg').remove();
    
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = element.offsetHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) {
      return;
    }

    const radius = Math.min(width, height) / 2;

    // FIX: Use named import 'select' instead of 'd3.select'.
    const svg = select(element).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    const features = this.invertedData[0].axes.map(a => a.axis);
    const numFeatures = features.length;
    const angleSlice = Math.PI * 2 / numFeatures;

    // FIX: Use named import 'scaleLinear' instead of 'd3.scaleLinear'.
    const rScale = scaleLinear()
        .domain([0, 10])
        .range([0, radius]);

    // Grid
    const grid = svg.append('g').attr('class', 'grid');
    grid.selectAll('circle')
        // FIX: Use named import 'range' instead of 'd3.range'.
        .data(range(1, 6).reverse())
        .enter()
        .append('circle')
        .attr('r', d => radius / 5 * d)
        .style('fill', '#f8fafc')
        .style('stroke', '#e2e8f0');

    // Axes
    const axes = svg.selectAll('.axis')
        .data(features)
        .enter().append('g')
        .attr('class', 'axis');

    axes.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', (d, i) => rScale(10.5) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => rScale(10.5) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('class', 'line')
        .style('stroke', '#e2e8f0')
        .style('stroke-width', '1px');

    axes.append('text')
        .attr('class', 'legend')
        .style('font-size', '10px')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('x', (d, i) => rScale(12) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y', (d, i) => rScale(12) * Math.sin(angleSlice * i - Math.PI / 2))
        .text(d => d)
        .call(this.wrap, 60);

    // Polygons
    // FIX: Use named import 'lineRadial' instead of 'd3.lineRadial'.
    const radarLine = lineRadial<any>()
      // FIX: Use named import 'curveLinearClosed' instead of 'd3.curveLinearClosed'.
      .curve(curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);

    svg.selectAll('.radarArea')
        .data(this.invertedData)
        .enter().append('path')
        .attr('class', 'radarArea')
        .attr('d', d => radarLine(d.axes))
        .style('fill', d => d.color)
        .style('fill-opacity', 0.2)
        .style('stroke', d => d.color)
        .style('stroke-width', '2px');
  }
  
  // FIX: Add proper type for d3 selection.
  private wrap(text: Selection<BaseType, unknown, BaseType, unknown>, width: number) {
      text.each(function(this: any) {
          // FIX: Use named import 'select' instead of 'd3.select'.
          let text = select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line: string[] = [],
              lineNumber = 0,
              lineHeight = 1.1, 
              x = text.attr("x"),
              y = text.attr("y"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
          while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node()!.getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
              }
          }
      });
  }
}
