const datasets = {
  'videogame': {
    title: 'Video Game Sales',
    description: 'Top 100 Most Sold Video Games Grouped by Platform',
    link: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
  },
  'movie': {
    title: 'Movie Sales',
    description: 'Top 100 Highest Grossing Movies Grouped By Genre',
    link: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
  },
  'kickstarter': {
    title: 'Kickstarter Pledges',
    description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    link: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
  }
}

const urlParams = new URLSearchParams(window.location.search);
const data = datasets[urlParams.get('data') || 'videogame'];

d3.json(data.link)
  .then(dataset => {
    const width = 960;
    const height = 570;
    const colorScheme = d3.scaleOrdinal()
      .range([
        '#1f77b4',
        '#aec7e8',
        '#ff7f0e',
        '#ffbb78',
        '#2ca02c',
        '#98df8a',
        '#d62728',
        '#ff9896',
        '#9467bd',
        '#c5b0d5',
        '#8c564b',
        '#c49c94',
        '#e377c2',
        '#f7b6d2',
        '#7f7f7f',
        '#c7c7c7',
        '#bcbd22',
        '#dbdb8d',
        '#17becf',
        '#9edae5'
      ].map(color => d3.interpolateRgb(color, 'white')(0.2)))

    // Title
    d3.select('main')
      .append('h1')
      .text(data.title)
      .attr('id', 'title')
      .style('font-size', '4.5rem')
      .style('font-family', "Arial, Helvetica, sans-serif")
      .style('font-weight', 700)
      .style('margin-top', '30px')
      .style('margin-bottom', '10px')

    // Description
    d3.select('main')
      .append('p')
      .text(data.description)
      .attr('id', 'description')
      .style('font-size', '1.6rem')
      .style('font-family', "Arial, Helvetica, sans-serif")
      .style('margin-bottom', '24px')

    // Main SVG
    const svg = d3.select('main')
      .append('svg')
      .style('width', width)
      .style('height', height)

    // Root
    const root = d3.hierarchy(dataset)
      .sum(d => d.value)
      .sort((a, b) => {
        return b.height - a.height || b.value - a.value;
      })

    // Treemap
    const treemap = d3.treemap()
      .size([width, height])
      .paddingInner(1)

    treemap(root);

    // Categories
    const categories = root.leaves()
      .map(d => d.data.category)
      .filter((d, i, self) => self.indexOf(d) === i)

    // Legend
    const legendRectWidth = 15;
    const horizontalSpacing = 150;
    const verticalSpacing = 10;
    const labelsPerRow = 3;

    const legend = d3.select('main')
      .append('svg')
      .attr('id', 'legend')
      .style('width', 500)
      .style('height', `${Math.ceil(categories.length / labelsPerRow) * (legendRectWidth + verticalSpacing)}`)
      .style('margin', '16px auto')
      .style('text-align', 'center')
      .style('padding-block', '10px')
      .style('box-sizing', 'content-box')

    const legendLabels = legend.append('g')
      .attr('transform', 'translate(60, 0)')
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${(i % labelsPerRow) * horizontalSpacing},
        ${Math.floor(i / labelsPerRow) * (legendRectWidth + verticalSpacing)})`
      )

    legendLabels.append('rect')
      .attr('class', 'legend-item')
      .style('width', legendRectWidth)
      .style('height', legendRectWidth)
      .style('fill', d => colorScheme(d))

    legendLabels.append('text')
      .text(d => d)
      .attr('x', legendRectWidth + 3)
      .attr('y', legendRectWidth - 2)
      .style('font-size', '1.5rem')
      .style('font-family', 'sans-serif')

    // Tooltip
    const tooltip = d3.select('main')
      .append('div')
      .attr('id', 'tooltip')
      .style('visibility', 'hidden')
      .style('position', 'absolute')
      .style('opacity', 0.9)
      .style('background-color', 'rgba(255, 255, 204, 0.95)')
      .style('padding', '10px')
      .style('border-radius', '2px')
      .style('box-shadow', '1px 1px 10px rgba(128, 128, 128, 0.6)')
      .style('font-size', '12px')
      .style('font-family', 'Arial')
      .style('text-align', 'center')

    // Cell
    const cell = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`)
      .on('mouseover', (e, d) => {
        tooltip.style('visibility', 'visible')

        tooltip.html(
          `Name: ${d.data.name}<br>
          Category: ${d.data.category}<br>
          Value: ${d.data.value}`
        ).attr('data-value', d.data.value)
      })
      .on('mousemove', e => {
        tooltip.style('left', `${e.pageX + 10}px`)
          .style('top', `${e.pageY - tooltip.node().offsetHeight / 2}px`)
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden')
      })

    // Tile
    cell.append('rect')
      .attr('class', 'tile')
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScheme(d.data.category))

    cell.append('text')
      .selectAll('tspan')
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append('tspan')
      .text(d => d)
      .attr('x', 4)
      .attr('y', (d, i) => 13 + i * 10)
      .style('font-family', 'sans-serif')
  })
  .catch(error => console.error(error));
