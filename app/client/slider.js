Template.slider.onRendered(function () {
    const cellSize = 10;
    const positionToY = { front: 0 * cellSize, left: 1 * cellSize, right:2 * cellSize, back: 3 * cellSize }

    const svg = d3.select('.js-slider')

    svg
      .on('mouseleave', function() {
        $('.line-mouse').attr('x1', -10).attr('x2', -10)

        $('.js-mouse-date').html('');
        $('.js-mouse-offset').html('');
      })
      .on('mousemove', function() {
        const sequence = Sequences.findOne();
        if (!sequence) return;
        const bcr = $('.js-slider')[0].getBoundingClientRect();
        const offset = Math.max(0, d3.event.pageX - bcr.x) / bcr.width * 700;
        const date = moment(sequence.startedAt).add(offset, 'seconds');
        $('.line-mouse').attr('x1', offset).attr('x2', offset)

        $('.js-mouse-date').html(date.format('MM-DD-YYYY HH:mm:ss'));
        $('.js-mouse-offset').html(Number(offset).toFixed(2));

        if (d3.event.buttons) {
          videoSetOffset(offset);
        }
      })
      .on('click', function() {
        const sequence = Sequences.findOne();
        if (!sequence) return;
        const bcr = $('.js-slider')[0].getBoundingClientRect();
        const offset = Math.max(0, d3.event.pageX - bcr.x) / bcr.width * 700;
        const date = moment(sequence.startedAt).add(offset, 'seconds').toDate();
        videoSetOffset(offset);
      })

  // const margin = 80;
  this.autorun(() => {
    const sequence = Sequences.findOne();
    if (!sequence) return;
    const clips = Clips.find(/* { sequenceId: sequence._id } */).fetch();

    svg.selectAll('rect').remove();

    svg.select('g')
      .selectAll('rect')
      .data(clips)
      .join('rect')
      .attr('width', d => d.duration)
      .attr('height', cellSize - 1.5)
      .attr('x', d => {
        // l({ d, i })
        return (d.startedAt - sequence.startedAt) / 1000;
        // timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 10
      })
      .attr('y', d => {
        l(positionToY[d.position])
        return positionToY[d.position];
      })
  });
});
