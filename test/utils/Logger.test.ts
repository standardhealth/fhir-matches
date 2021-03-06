import { logger, stats, errorsAndWarnings } from '../../src/utils/Logger';
// MUTE_LOGS controls whether or not logs get printed during testing.
// Usually, we don't want logs actually printed, as they cause clutter.
const MUTE_LOGS = true;

describe('Logger', () => {
  let originalWriteFn = logger.transports[0]['write'];

  beforeEach(() => {
    stats.reset();
    errorsAndWarnings.reset();
    if (MUTE_LOGS) {
      originalWriteFn = logger.transports[0]['write'];
      logger.transports[0]['write'] = jest.fn(() => true);
    }
  });

  afterEach(() => {
    if (MUTE_LOGS) {
      logger.transports[0]['write'] = originalWriteFn;
    }
  });

  it('should store number of logger debug messages', () => {
    logger.debug('debug1');
    expect(stats.numDebug).toBe(1);
    logger.debug('debug2');
    expect(stats.numDebug).toBe(2);
  });

  it('should store number of logger info messages', () => {
    logger.info('info1');
    expect(stats.numInfo).toBe(1);
    logger.info('info2');
    expect(stats.numInfo).toBe(2);
  });

  it('should store number of logger warning messages', () => {
    logger.warn('warn1');
    expect(stats.numWarn).toBe(1);
    logger.warn('warn2');
    expect(stats.numWarn).toBe(2);
  });

  it('should store number of logger error messages', () => {
    logger.error('error1');
    expect(stats.numError).toBe(1);
    logger.error('error2');
    expect(stats.numError).toBe(2);
  });

  it('should not store number of logger silly messages', () => {
    logger.silly('silly1');
    expect(stats.numDebug).toBe(0);
    expect(stats.numInfo).toBe(0);
    expect(stats.numWarn).toBe(0);
    expect(stats.numError).toBe(0);
  });

  it('should store number of logger messages of all types simultaneously', () => {
    logger.error('error1');
    expect(stats.numDebug).toBe(0);
    expect(stats.numInfo).toBe(0);
    expect(stats.numWarn).toBe(0);
    expect(stats.numError).toBe(1);
    logger.info('info1');
    expect(stats.numDebug).toBe(0);
    expect(stats.numInfo).toBe(1);
    expect(stats.numWarn).toBe(0);
    expect(stats.numError).toBe(1);
    logger.warn('warn1');
    expect(stats.numDebug).toBe(0);
    expect(stats.numInfo).toBe(1);
    expect(stats.numWarn).toBe(1);
    expect(stats.numError).toBe(1);
    logger.info('info2');
    expect(stats.numDebug).toBe(0);
    expect(stats.numInfo).toBe(2);
    expect(stats.numWarn).toBe(1);
    expect(stats.numError).toBe(1);
    logger.debug('debug1');
    expect(stats.numDebug).toBe(1);
    expect(stats.numInfo).toBe(2);
    expect(stats.numWarn).toBe(1);
    expect(stats.numError).toBe(1);
    logger.silly('silly1'); // should not affect any counts
    expect(stats.numDebug).toBe(1);
    expect(stats.numInfo).toBe(2);
    expect(stats.numWarn).toBe(1);
    expect(stats.numError).toBe(1);
  });

  it('should correctly reset the stats', () => {
    logger.debug('debug1');
    logger.info('info1');
    logger.warn('warn1');
    logger.error('error1');
    expect(stats.numDebug).toBe(1);
    expect(stats.numInfo).toBe(1);
    expect(stats.numWarn).toBe(1);
    expect(stats.numError).toBe(1);
    stats.reset();
    expect(stats.numDebug).toBe(0);
    expect(stats.numInfo).toBe(0);
    expect(stats.numWarn).toBe(0);
    expect(stats.numError).toBe(0);
  });

  it('should not track errors and warnings when shouldTrack is false', () => {
    logger.warn('warn1');
    logger.error('error1');
    expect(errorsAndWarnings.shouldTrack).toBe(false);
    expect(errorsAndWarnings.errors).toHaveLength(0);
    expect(errorsAndWarnings.warnings).toHaveLength(0);
  });

  it('should track errors and warnings when shouldTrack is true', () => {
    errorsAndWarnings.shouldTrack = true;
    logger.warn('warn1', { location: [1, 2, 3, 4], file: 'Input_0' });
    logger.warn('warn2');
    logger.error('error1');
    logger.error('error2');
    expect(errorsAndWarnings.shouldTrack).toBe(true);
    expect(errorsAndWarnings.warnings).toHaveLength(2);
    expect(errorsAndWarnings.warnings).toContainEqual({
      location: [1, 2, 3, 4],
      message: 'warn1',
      input: 'Input_0'
    });
    expect(errorsAndWarnings.warnings).toContainEqual({ message: 'warn2' });
    expect(errorsAndWarnings.errors).toHaveLength(2);
    expect(errorsAndWarnings.errors).toContainEqual({ message: 'error1' });
    expect(errorsAndWarnings.errors).toContainEqual({ message: 'error2' });
  });

  it('should reset errors and warnings', () => {
    errorsAndWarnings.shouldTrack = true;
    logger.warn('warn1');
    logger.error('error1');
    expect(errorsAndWarnings.shouldTrack).toBe(true);
    expect(errorsAndWarnings.warnings).toHaveLength(1);
    expect(errorsAndWarnings.warnings).toContainEqual({ message: 'warn1' });
    expect(errorsAndWarnings.errors).toHaveLength(1);
    expect(errorsAndWarnings.errors).toContainEqual({ message: 'error1' });
    errorsAndWarnings.reset();
    expect(errorsAndWarnings.errors).toHaveLength(0);
    expect(errorsAndWarnings.warnings).toHaveLength(0);
  });
});
