Template.slider.onRendered(function () {
    const cellSize = 10;
    const positionToY = { front: 0 * cellSize, left: 1 * cellSize, right:2 * cellSize, back: 3 * cellSize };

    const svg = d3.select('.js-slider');

    svg
      .on('mouseleave', function() {
        $('.line-mouse').attr('x1', -10).attr('x2', -10)

        $('.js-mouse-date').html('');
        $('.js-mouse-offset').html('');
      })
      .on('mousemove', function() {
        const sequence = Sequences.findOne(Session.get('selectedSequenceId'));
        if (!sequence) return;
        const bcr = $('.js-slider')[0].getBoundingClientRect();
        const offset = Math.max(0, d3.event.pageX - bcr.x) / bcr.width * 700;
        const date = moment(sequence.startedAt).add(offset, 'seconds');
        $('.line-mouse').attr('x1', offset).attr('x2', offset);

        $('.js-mouse-date').html(date.format('YY-MM-DD HH:mm:ss'));
        $('.js-mouse-offset').html(humanizeDuration(offset));

        if (d3.event.buttons) {
          videoSetOffset(offset);
        }
      })
      .on('click', function() {
        const sequence = Sequences.findOne(Session.get('selectedSequenceId'));
        if (!sequence) return;
        const bcr = $('.js-slider')[0].getBoundingClientRect();
        const offset = Math.max(0, d3.event.pageX - bcr.x) / bcr.width * 700;
        const date = moment(sequence.startedAt).add(offset, 'seconds').toDate();
        videoSetOffset(offset);
      })

  let drag = d3.drag()
    .on('start', function () { d3.select(this).raise().classed('active', true); })
    .on('drag', function () { $('.line-start').attr('x1', d3.event.x).attr('x2', d3.event.x) })
    .on('end', function () { d3.select(this).classed('active', false); });

  svg.selectAll('.line-start')
    .call(drag);

  let drag2 = d3.drag()
    .on('start', function () { d3.select(this).raise().classed('active', true); })
    .on('drag', function () { $('.line-end').attr('x1', d3.event.x).attr('x2', d3.event.x) })
    .on('end', function () { d3.select(this).classed('active', false); });

  svg.selectAll('.line-end')
    .call(drag2);

  this.autorun(() => {
    log('slider autorun render react');
    const sequence = Sequences.findOne(Session.get('selectedSequenceId'));
    if (!sequence) return;
    const clips = Clips.find({ sequenceId: sequence._id }).fetch();

    svg.selectAll('rect').remove();

    svg.select('g')
      .selectAll('rect')
      .data(clips)
      .join('rect')
      .attr('width', d => d.duration)
      .attr('height', cellSize - 1.5)
      .attr('x', d => (d.startedAt - sequence.startedAt) / 1000)
      .attr('y', d => positionToY[d.position])
  });
});
