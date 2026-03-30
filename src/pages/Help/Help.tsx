/**
 * 帮助中心页面
 * 
 * 路由：/help
 * 访问权限：公开
 * 
 * 功能:
 * - 常见问题解答
 * - 使用指南
 * - 技术支持联系方式
 */

import { Card, Typography, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

export default function Help() {
  const { t } = useTranslation();
  
  return (
    <div>
      <Title level={2}>{t('help.title')}</Title>
      <Paragraph>
        {t('help.subtitle')}
      </Paragraph>

      <Card title={t('help.faqTitle')} style={{ marginTop: 24 }}>
        <Collapse accordion>
          <Panel header={t('help.howToAddDevice')} key="1">
            <p>{t('help.howToAddDeviceAnswer')}</p>
          </Panel>
          <Panel header={t('help.howToViewMonitor')} key="2">
            <p>{t('help.howToViewMonitorAnswer')}</p>
          </Panel>
          <Panel header={t('help.howToExportLogs')} key="3">
            <p>{t('help.howToExportLogsAnswer')}</p>
          </Panel>
          <Panel header={t('help.forgotPassword')} key="4">
            <p>{t('help.forgotPasswordAnswer')}</p>
          </Panel>
        </Collapse>
      </Card>

      <Card title={t('help.supportTitle')} style={{ marginTop: 24 }}>
        <Paragraph>
          <strong>{t('help.hotline')}：</strong>400-123-4567<br />
          <strong>{t('help.email')}：</strong>support@example.com<br />
          <strong>{t('help.serviceHours')}：</strong>{t('help.serviceTimeValue')}
        </Paragraph>
      </Card>
    </div>
  );
}
