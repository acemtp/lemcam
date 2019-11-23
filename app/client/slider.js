Template.slider.onRendered(function () {
  // if (!Clips.findOne()) {
  //   _.each(_clips, c => {
  //     c.startedAt = new Date(c.startedAt);
  //     c.endedAt = new Date(c.endedAt);
  //     Clips.insert(c);
  //   });
  //   _.each(_sequences, s => {
  //     s.startedAt = new Date(s.startedAt);
  //     s.endedAt = new Date(s.endedAt);
  //     Sequences.insert(s);
  //   });
  // }

    const cellSize = 10;
    const positionToY = { front: 0 * cellSize, left: 1 * cellSize, right:2 * cellSize, back: 3 * cellSize }

    const svg = d3.select('.js-slider')
      // .attr('transform', `translate(${margin}, ${margin})`);

    const g = svg.append('g')

    const lineMouse = svg.append('line')
      .attr('class', 'line-mouse')
      .attr('x1', 10)
      .attr('y1', 0)
      .attr('x2', 10)
      .attr('y2', 60)

    const lineCurrent = svg.append('line')
      .attr('class', 'line-current')
      .attr('x1', 10)
      .attr('y1', 0)
      .attr('x2', 10)
      .attr('y2', 60)


    svg
      .on('mousemove', function() {
        const sequence = Sequences.findOne();
        const bcr = $('.js-slider')[0].getBoundingClientRect();
        const offset = Math.max(0, d3.event.pageX - bcr.x) / bcr.width * 700;
        const date = moment(sequence.startedAt).add(offset, 'seconds');
        lineMouse.attr('x1', offset).attr('x2', offset)

        $('.js-mouse-date').html(date.format('MM-DD-YYYY HH:mm:ss'));
        $('.js-mouse-offset').html(Number(offset).toFixed(2));

        if (d3.event.buttons) {
          videoSetOffset(offset);
        }
      })
      .on('click', function() {
        const sequence = Sequences.findOne();
        const bcr = $('.js-slider')[0].getBoundingClientRect();
        const offset = Math.max(0, d3.event.pageX - bcr.x) / bcr.width * 700;
        const date = moment(sequence.startedAt).add(offset, 'seconds').toDate();
        videoSetOffset(offset);
      })

  // const margin = 80;
  this.autorun(() => {
    const sequence = Sequences.findOne();
    const clips = Clips.find(/* { sequenceId: sequence._id } */).fetch();

  l({ clips, sequence })

    svg.selectAll('rect').remove();

    g
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



// eslint-disable-next-line quotes
const _clips = [{"_id":"vid_xmonxZZ9gS9E2bCwt","name":"2019-11-10_09-41-39-back.mp4","position":"back","startedAt":"2019-11-10T08:41:42.000Z","endedAt":"2019-11-10T08:42:39.000Z","timeScale":10000,"duration":57.0183},{"_id":"vid_xJzkL3gmN4bDNp9NA","name":"2019-11-10_09-48-44-back.mp4","position":"back","startedAt":"2019-11-10T08:48:46.000Z","endedAt":"2019-11-10T08:49:13.000Z","timeScale":10000,"duration":27.6043},{"_id":"vid_SQNnZwQh3ZWPdL6sW","name":"2019-11-10_09-43-40-back.mp4","position":"back","startedAt":"2019-11-10T08:43:43.000Z","endedAt":"2019-11-10T08:44:41.000Z","timeScale":10000,"duration":57.5294},{"_id":"vid_PwZcvWpKWuuk37svg","name":"2019-11-10_09-44-41-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:44:43.000Z","endedAt":"2019-11-10T08:45:42.000Z","timeScale":10000,"duration":58.2149},{"_id":"vid_89AwDcWWomvv6cwhT","name":"2019-11-10_09-40-38-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:40:40.000Z","endedAt":"2019-11-10T08:41:39.000Z","timeScale":10000,"duration":58.5175},{"_id":"vid_yCbBPspkRCfmW8YGK","name":"2019-11-10_09-45-42-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:45:44.000Z","endedAt":"2019-11-10T08:46:43.000Z","timeScale":10000,"duration":57.7202},{"_id":"vid_zWxSJupybvwHXkjHT","name":"2019-11-10_09-41-39-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:41:41.000Z","endedAt":"2019-11-10T08:42:39.000Z","timeScale":10000,"duration":57.5524},{"_id":"vid_rMP84e4G6sH9FJGdT","name":"2019-11-10_09-48-44-front.mp4","position":"front","startedAt":"2019-11-10T08:48:47.000Z","endedAt":"2019-11-10T08:49:13.000Z","timeScale":10000,"duration":25.8201},{"_id":"vid_jbXEKGCKM3zBtc7EW","name":"2019-11-10_09-47-44-back.mp4","position":"back","startedAt":"2019-11-10T08:47:47.000Z","endedAt":"2019-11-10T08:48:44.000Z","timeScale":10000,"duration":56.499},{"_id":"vid_bQDwS5QLqAhmsE4s5","name":"2019-11-10_09-38-37-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:38:38.000Z","endedAt":"2019-11-10T08:39:37.000Z","timeScale":10000,"duration":58.4374},{"_id":"vid_wqHbKbzwHX3uiriAi","name":"2019-11-10_09-45-42-front.mp4","position":"front","startedAt":"2019-11-10T08:45:44.000Z","endedAt":"2019-11-10T08:46:43.000Z","timeScale":10000,"duration":57.8245},{"_id":"vid_jhsGXefM9hSDgDr6X","name":"2019-11-10_09-39-37-back.mp4","position":"back","startedAt":"2019-11-10T08:39:41.000Z","endedAt":"2019-11-10T08:40:38.000Z","timeScale":10000,"duration":56.1201},{"_id":"vid_44dAgWqck7Y8vPdZn","name":"2019-11-10_09-48-44-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:48:46.000Z","endedAt":"2019-11-10T08:49:13.000Z","timeScale":10000,"duration":27.1846},{"_id":"vid_4Lza8JkKvhRCCeLiy","name":"2019-11-10_09-44-41-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:44:43.000Z","endedAt":"2019-11-10T08:45:42.000Z","timeScale":10000,"duration":58.258},{"_id":"vid_7hfjnuSGmrgAimL3c","name":"2019-11-10_09-46-43-back.mp4","position":"back","startedAt":"2019-11-10T08:46:44.000Z","endedAt":"2019-11-10T08:47:43.000Z","timeScale":10000,"duration":58.9229},{"_id":"vid_Xrpfztudw7xfKABve","name":"2019-11-10_09-43-40-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:43:43.000Z","endedAt":"2019-11-10T08:44:41.000Z","timeScale":10000,"duration":57.628},{"_id":"vid_XEHRNYy8Kyxw7FErJ","name":"2019-11-10_09-46-43-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:46:46.000Z","endedAt":"2019-11-10T08:47:43.000Z","timeScale":10000,"duration":56.5321},{"_id":"vid_pFPvsrMiBcAkBXwX5","name":"2019-11-10_09-47-44-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:47:46.000Z","endedAt":"2019-11-10T08:48:44.000Z","timeScale":10000,"duration":58.0701},{"_id":"vid_sbc48KsKQXtr4qsqK","name":"2019-11-10_09-39-37-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:39:40.000Z","endedAt":"2019-11-10T08:40:38.000Z","timeScale":10000,"duration":57.1763},{"_id":"vid_pH6KNH9ZzeikDFHud","name":"2019-11-10_09-43-40-front.mp4","position":"front","startedAt":"2019-11-10T08:43:45.000Z","endedAt":"2019-11-10T08:44:41.000Z","timeScale":10000,"duration":55.766},{"_id":"vid_ohJkedZi68YNcuFvT","name":"2019-11-10_09-43-40-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:43:44.000Z","endedAt":"2019-11-10T08:44:41.000Z","timeScale":10000,"duration":56.5946},{"_id":"vid_EEEZkERdwtDiGGbR5","name":"2019-11-10_09-46-43-front.mp4","position":"front","startedAt":"2019-11-10T08:46:45.000Z","endedAt":"2019-11-10T08:47:43.000Z","timeScale":10000,"duration":57.6686},{"_id":"vid_z6emJPiHrwBM5omXz","name":"2019-11-10_09-41-39-front.mp4","position":"front","startedAt":"2019-11-10T08:41:41.000Z","endedAt":"2019-11-10T08:42:39.000Z","timeScale":10000,"duration":57.7384},{"_id":"vid_xgJgFMjLCcKoeuPXd","name":"2019-11-10_09-42-40-back.mp4","position":"back","startedAt":"2019-11-10T08:42:41.000Z","endedAt":"2019-11-10T08:43:40.000Z","timeScale":10000,"duration":58.1558},{"_id":"vid_gkaXDxEFTa6vkni7G","name":"2019-11-10_09-42-40-front.mp4","position":"front","startedAt":"2019-11-10T08:42:44.000Z","endedAt":"2019-11-10T08:43:40.000Z","timeScale":10000,"duration":55.8522},{"_id":"vid_Ce2Fp4QkjM9zouzrJ","name":"2019-11-10_09-40-38-back.mp4","position":"back","startedAt":"2019-11-10T08:40:40.000Z","endedAt":"2019-11-10T08:41:39.000Z","timeScale":10000,"duration":57.9589},{"_id":"vid_fQLTB59Jhh59uqjdJ","name":"2019-11-10_09-41-39-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:41:42.000Z","endedAt":"2019-11-10T08:42:39.000Z","timeScale":10000,"duration":56.5999},{"_id":"vid_EH7Gxjtpjn4ohCReS","name":"2019-11-10_09-42-40-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:42:42.000Z","endedAt":"2019-11-10T08:43:40.000Z","timeScale":10000,"duration":57.2131},{"_id":"vid_GZqD2f9XjzDTRrT9g","name":"2019-11-10_09-45-42-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:45:44.000Z","endedAt":"2019-11-10T08:46:43.000Z","timeScale":10000,"duration":58.2331},{"_id":"vid_NmsMDTSoCp9uZzbkq","name":"2019-11-10_09-39-37-front.mp4","position":"front","startedAt":"2019-11-10T08:39:40.000Z","endedAt":"2019-11-10T08:40:38.000Z","timeScale":10000,"duration":58.2811},{"_id":"vid_EKg7HiX3vSNY6sfau","name":"2019-11-10_09-40-38-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:40:40.000Z","endedAt":"2019-11-10T08:41:39.000Z","timeScale":10000,"duration":58.0395},{"_id":"vid_YqaAKePfYxgmKw9HT","name":"2019-11-10_09-38-37-back.mp4","position":"back","startedAt":"2019-11-10T08:38:38.000Z","endedAt":"2019-11-10T08:39:37.000Z","timeScale":10000,"duration":58.3659},{"_id":"vid_x3hoKx3Ge5PdABiQM","name":"2019-11-10_09-38-37-front.mp4","position":"front","startedAt":"2019-11-10T08:38:40.000Z","endedAt":"2019-11-10T08:39:37.000Z","timeScale":10000,"duration":57.0843},{"_id":"vid_tnFLCFwGF7FivaSXH","name":"2019-11-10_09-44-41-front.mp4","position":"front","startedAt":"2019-11-10T08:44:43.000Z","endedAt":"2019-11-10T08:45:42.000Z","timeScale":10000,"duration":57.9033},{"_id":"vid_KsgyjzGWh6pTQxWSg","name":"2019-11-10_09-40-38-front.mp4","position":"front","startedAt":"2019-11-10T08:40:41.000Z","endedAt":"2019-11-10T08:41:39.000Z","timeScale":10000,"duration":57.6648},{"_id":"vid_RHLJB7vnBxoFrxX4d","name":"2019-11-10_09-42-40-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:42:42.000Z","endedAt":"2019-11-10T08:43:40.000Z","timeScale":10000,"duration":57.2567},{"_id":"vid_dcNe4SYho2HGWGghQ","name":"2019-11-10_09-48-44-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:48:47.000Z","endedAt":"2019-11-10T08:49:13.000Z","timeScale":10000,"duration":26.1656},{"_id":"vid_TQkaNdBEFBE7rthdS","name":"2019-11-10_09-38-37-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:38:40.000Z","endedAt":"2019-11-10T08:39:37.000Z","timeScale":10000,"duration":57.4048},{"_id":"vid_bcBpR3c5XSwikThjD","name":"2019-11-10_09-47-44-front.mp4","position":"front","startedAt":"2019-11-10T08:47:46.000Z","endedAt":"2019-11-10T08:48:44.000Z","timeScale":10000,"duration":57.1852},{"_id":"vid_mQaTThhAkQXcNZGeB","name":"2019-11-10_09-39-37-right_repeater.mp4","position":"right","startedAt":"2019-11-10T08:39:40.000Z","endedAt":"2019-11-10T08:40:38.000Z","timeScale":10000,"duration":58.1812},{"_id":"vid_vQTADnL3WXxH6y58P","name":"2019-11-10_09-45-42-back.mp4","position":"back","startedAt":"2019-11-10T08:45:46.000Z","endedAt":"2019-11-10T08:46:43.000Z","timeScale":10000,"duration":56.6478},{"_id":"vid_r3bdGvsxdAxhtp8Yr","name":"2019-11-10_09-47-44-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:47:46.000Z","endedAt":"2019-11-10T08:48:44.000Z","timeScale":10000,"duration":58.0138},{"_id":"vid_7bwEkWpxyiKExaDZT","name":"2019-11-10_09-46-43-left_repeater.mp4","position":"left","startedAt":"2019-11-10T08:46:45.000Z","endedAt":"2019-11-10T08:47:43.000Z","timeScale":10000,"duration":57.5085},{"_id":"vid_dAPaMeXqXxnXwp6aA","name":"2019-11-10_09-44-41-back.mp4","position":"back","startedAt":"2019-11-10T08:44:45.000Z","endedAt":"2019-11-10T08:45:42.000Z","timeScale":10000,"duration":56.1858}];

// eslint-disable-next-line quotes
const _sequences = [{"_id":"seq_HnANBEM4GrqG3MRas","startedAt":"2019-11-10T08:38:38.000Z","endedAt":"2019-11-10T08:49:13.000Z","duration":635,"rightVideoIds":["vid_bQDwS5QLqAhmsE4s5","vid_mQaTThhAkQXcNZGeB","vid_EKg7HiX3vSNY6sfau","vid_fQLTB59Jhh59uqjdJ","vid_RHLJB7vnBxoFrxX4d","vid_Xrpfztudw7xfKABve","vid_4Lza8JkKvhRCCeLiy","vid_GZqD2f9XjzDTRrT9g","vid_XEHRNYy8Kyxw7FErJ","vid_pFPvsrMiBcAkBXwX5","vid_44dAgWqck7Y8vPdZn"],"backVideoIds":["vid_YqaAKePfYxgmKw9HT","vid_jhsGXefM9hSDgDr6X","vid_Ce2Fp4QkjM9zouzrJ","vid_xmonxZZ9gS9E2bCwt","vid_xgJgFMjLCcKoeuPXd","vid_SQNnZwQh3ZWPdL6sW","vid_dAPaMeXqXxnXwp6aA","vid_vQTADnL3WXxH6y58P","vid_7hfjnuSGmrgAimL3c","vid_jbXEKGCKM3zBtc7EW","vid_xJzkL3gmN4bDNp9NA"],"frontVideoIds":["vid_x3hoKx3Ge5PdABiQM","vid_NmsMDTSoCp9uZzbkq","vid_KsgyjzGWh6pTQxWSg","vid_z6emJPiHrwBM5omXz","vid_gkaXDxEFTa6vkni7G","vid_pH6KNH9ZzeikDFHud","vid_tnFLCFwGF7FivaSXH","vid_wqHbKbzwHX3uiriAi","vid_EEEZkERdwtDiGGbR5","vid_bcBpR3c5XSwikThjD","vid_rMP84e4G6sH9FJGdT"],"leftVideoIds":["vid_TQkaNdBEFBE7rthdS","vid_sbc48KsKQXtr4qsqK","vid_89AwDcWWomvv6cwhT","vid_zWxSJupybvwHXkjHT","vid_EH7Gxjtpjn4ohCReS","vid_ohJkedZi68YNcuFvT","vid_PwZcvWpKWuuk37svg","vid_yCbBPspkRCfmW8YGK","vid_7bwEkWpxyiKExaDZT","vid_r3bdGvsxdAxhtp8Yr","vid_dcNe4SYho2HGWGghQ"]}]