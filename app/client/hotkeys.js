import hotkeys from 'hotkeys-js';

hotkeys('left', event => {
  event.preventDefault();

  const selectedMinuteId = Session.get('selectedMinuteId');
  if (!selectedMinuteId) return;
  const minute = Minutes.findOne(selectedMinuteId);
  if (!minute) return;

  const nextMinute = Minutes.findOne({ createdAt: { $lt: minute.createdAt } }, { sort: { createdAt: -1 } });
  if (!nextMinute) return;

  Session.set('selectedMinuteId', nextMinute._id);

  endCount = 0;
});

hotkeys('right', event => {
  event.preventDefault();

  const selectedMinuteId = Session.get('selectedMinuteId');
  if (!selectedMinuteId) return;
  const minute = Minutes.findOne(selectedMinuteId);
  if (!minute) return;

  const previousMinute = Minutes.findOne({ createdAt: { $gt: minute.createdAt } }, { sort: { createdAt: 1 } });
  if (!previousMinute) return;

  Session.set('selectedMinuteId', previousMinute._id);

  endCount = 0;
});

hotkeys('up', event => {
  event.preventDefault();

  const selectedMinuteId = Session.get('selectedMinuteId');
  if (!selectedMinuteId) return;
  const sequence = Sequences.findOne({ minuteIds: selectedMinuteId });
  if (!sequence) return;

  const olderSequence = Sequences.findOne({ startedAt: { $lt: sequence.startedAt } }, { sort: { startedAt: -1 } });
  if (!olderSequence) return;

  Session.set('selectedMinuteId', olderSequence.minuteIds[0]);

  endCount = 0;
});

hotkeys('down', event => {
  event.preventDefault();

  const selectedMinuteId = Session.get('selectedMinuteId');
  if (!selectedMinuteId) return;
  const sequence = Sequences.findOne({ minuteIds: selectedMinuteId });
  if (!sequence) return;

  const newerSequence = Sequences.findOne({ startedAt: { $gt: sequence.startedAt } }, { sort: { startedAt: 1 } });
  if (!newerSequence) return;

  Session.set('selectedMinuteId', newerSequence.minuteIds[0]);

  endCount = 0;
});

hotkeys('right', event => { event.preventDefault(); videoSetOffset(currentOffset + 1); });
hotkeys('left', event => { event.preventDefault(); videoSetOffset(Math.max(0, currentOffset - 1)); });

hotkeys('space', event => { event.preventDefault(); $('.js-play-toggle').click(); });

hotkeys('1,shift+1', event => { event.preventDefault(); $('.js-play-speed[data-speed="0.5"]').click(); });
hotkeys('2,shift+2', event => { event.preventDefault(); $('.js-play-speed[data-speed="1"]').click(); });
hotkeys('3,shift+3', event => { event.preventDefault(); $('.js-play-speed[data-speed="2"]').click(); });
hotkeys('4,shift+4', event => { event.preventDefault(); $('.js-play-speed[data-speed="6"]').click(); });
hotkeys('5,shift+5', event => { event.preventDefault(); $('.js-play-speed[data-speed="10"]').click(); });
